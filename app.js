
const canvas = require('canvas');
require('@tensorflow/tfjs-node'); // Load before @teachablemachine/image
const tmImage = require('@teachablemachine/image')
const express = require('express');

const app = express();

app.use(require('body-parser').raw({ type: 'image/png', limit: '3MB' }));


addEndpoint("test", 'https://teachablemachine.withgoogle.com/models/yourmodel/'); //You can add as many endpoints as you like

const JSDOM = require('jsdom').JSDOM;
global.window = new JSDOM(`<body><script>document.body.appendChild(document.createElement("hr"));</script></body>`).window;
global.document = window.document;
global.fetch = require('node-fetch');

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

async function addEndpoint(name, URL){
    let model;
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    model = await tmImage.load(modelURL, metadataURL);
    app.post('/' + name, (req, res, next) => {
        getPrediction(model, _arrayBufferToBase64(req.body), (output) => {
            res.send(output);
        });
      
    });
}

async function getPrediction(model, data, fu) {
    const can = canvas.createCanvas(64, 64);
    const ctx = can.getContext('2d');

    const img = new canvas.Image();
    img.onload = async () => {
        ctx.drawImage(img, 0, 0, 64, 64);

        const prediction = await model.predict(can);
        console.log(prediction);
        fu(prediction);
    }
    img.onerror = err => { throw err; }
    img.src = "data:image/png;base64," + data;
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}