const https = require('https');
const fs = require('fs');
const os = require('os');

const url = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
const token = process.env.TELEGRAM_TOKEN;
const channel = '@preciogasoillasmesas';
const stationId = '8907';

let data = "";
https.get(url, (response) => {
  response
    .on("data", append => data += append )
    .on("error", e => console.log(e) )
    .on("end", ()=> {
      
      data = JSON.parse(data);
      data = data.ListaEESSPrecio.find((station) => station['IDEESS'] === stationId);
      fs.appendFileSync('history.txt', JSON.stringify(data) + os.EOL);

      const price = data['Precio Gasoleo A'];
      const text = `Buenos días! Hoy el precio del Gasoil A en Las Mesas es de ${price}€`;
      
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
    });
}).on('error', (err) => {
    console.log('Error: ', err.message);
});