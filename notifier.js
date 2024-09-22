import history from './history.json' assert { type: "json" };
import https from 'https';
import fs from 'fs';

const url = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
const token = process.env.TELEGRAM_TOKEN;
const channel = '@preciogasoillasmesas';
const stationId = '8907';

const sendNotification = (price) => {
    const text = `El nuevo precio del gasoil en Las Mesas es de ${price}€`;
    const postData = JSON.stringify({
        chat_id: channel,
        text: text,
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options);
    req.write(postData);
    req.end();
}

let data = "";
https.get(url, (response) => {
    response
        .on("data", append => data += append)
        .on("end", () => {

            const lastPrice = history.length ? history[history.length - 1]['Precio Gasoleo A'] : null;

            /**
             * Store new price
             */
            const response = JSON.parse(data);
            const station = response.ListaEESSPrecio.find((station) => station['IDEESS'] === stationId);
            const stationWithDate = {
                Fecha: Date.now(),
                ...station,
            };
            history.push(stationWithDate);
            fs.writeFile('history.json', JSON.stringify(history), 'utf8', () => null);

            /**
             * Check send notification
             */
            const currentPrice = station['Precio Gasoleo A'];
            if (lastPrice !== currentPrice) {
                sendNotification(currentPrice);
            }
        });
}).on('error', (err) => {
    console.log('Error: ', err.message);
});