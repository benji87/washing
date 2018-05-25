const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const request = require('request');
// const MongoClient = require('mongodb').MongoClient;
// const mongoUrl = 'mongodb://localhost:27017/remos';

const listenFor = ['event'];

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => console.log('Webhook server is listening, port 5000'));

const ws = new WebSocket('ws://192.168.1.7:812/api/websocket');

ws.on('open', function open() {
    console.log('open');

    ws.send(JSON.stringify({type:'auth', api_password:'io659CJa4dPb98n5'}), function ack(error) {
        console.log("Error:" + error);
    });
    ws.send(JSON.stringify({'id': 18, type: 'subscribe_events', event_type: "state_changed"}), function ack(error) {
        console.log("Error:" + error);
    });
});

ws.on('error', function(e) {
    console.log(e);
});

ws.on('message', function incoming(data) {

    const response = JSON.parse(data);

    console.log(response);

    if(response.type && listenFor.includes(response.type)) {

        const sensor = response.event.data.new_state.attributes.friendly_name;
        const listenForSensors = ['motion', 'lock', 'door', 'heat', 'smoke', 'water'];

        if(listenForSensors.length !== 0 && listenForSensors.includes(sensor)) {

            const sensorState = 'sensors.' + sensor + '.state';
            const sensorUpdate = 'sensors.' + sensor + '.last_state_change';
            const data = {
                idKey : 'property_id',
                id : '5a2a51dd3a6d7b9dc2ed8603',
                update : {
                    $set: {
                        [sensorState]: response.event.data.new_state.state,
                        [sensorUpdate]: response.event.data.new_state.last_changed
                    }
                }
            };

            console.log("Sensor triggered: " + sensor);

            updateDocument('sensors', data, function (response) {
                console.log('1 document inserted');
            });
        }
    }
});


// const insertDocument = function(collection, data, callback) {
//     MongoClient.connect(mongoUrl, function(error, db) {
//         if(error) throw error;
//
//         db.collection(collection).insert(
//             data, function(error, response) {
//                 if(error) throw error;
//                 db.close();
//                 if(typeof callback === "function") {
//                     callback(response);
//                 }
//             })
//     })
// };
//
// const updateDocument = function(collection, data, callback) {
//     MongoClient.connect(mongoUrl, function(error, db) {
//
//         if(error) throw error;
//
//         const ObjectId = require('mongodb').ObjectID;
//
//         db.collection(collection).update(
//             { [data.idKey] : ObjectId(data.id) },
//             data.update, function (error, response) {
//                 if(error) throw error;
//                 db.close();
//                 if(typeof callback === "function") {
//                     callback(response);
//                 }
//             }
//         );
//
//     });
// };
