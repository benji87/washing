const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/washing';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/stats', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Content-Type', 'application/json');

    let stat = req.query.stat;
    let numResults = parseInt(req.query.numResults);

    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        const dbo = db.db("washing");
        const query = { sensor: stat };
        dbo.collection("stats").find(query).sort('_id', -1).limit(numResults).toArray((err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
            db.close();
        });
    });

});

app.listen(5000, () => console.log('Webhook server is listening, port 5000'));

const ws = new WebSocket('ws://192.168.1.7:8123/api/websocket');

ws.on('open', function open() {
    console.log('open');

    ws.send(JSON.stringify({type:'auth', api_password:'io659CJa4dPb98n5'}), function ack(error) {
        if(error) {
            console.log("Error:" + error);
        }
    });
    ws.send(JSON.stringify({'id': 18, type: 'subscribe_events', event_type: "state_changed"}), function ack(error) {
        if(error) {
            console.log("Error:" + error);
        }
    });
});

ws.on('error', function(error) {
    console.log(error);
});

ws.on('message', function incoming(data) {

    const response = JSON.parse(data);

    if(response.type === 'event') {

        const device = 'washing';


        if (typeof response.event.data.new_state.attributes.friendly_name !== 'undefined' && response.event.data.new_state.attributes.friendly_name.includes(device)) {

            const sensor = response.event.data.new_state.attributes.friendly_name.split(' ');
            const listenForSensors = ['power', 'current', 'energy', 'voltage', 'online', 'vibration', 'temperature'];

            if (listenForSensors.includes(sensor[1])) {

                let state = response.event.data.new_state.state;
                let timestamp = response.event.time_fired;

                const data = {
                    sensor: sensor[1],
                    state: state,
                    timestamp: timestamp
                };

                console.log(`${sensor[1]} ${state} ${timestamp} \n`);
                insertDocument('stats', data, ()  => {
                    console.log('1 document inserted');
                });
            }


        }
    }

});


const insertDocument = (collection, data, callback) => {
    MongoClient.connect(mongoUrl, (error, client) => {
        if(error) throw error;

        const db = client.db('washing');

        db.collection(collection).insert(
            data, (error, response) => {
                if(error) throw error;
                client.close();
                if(typeof callback === "function") {
                    callback(response);
                }
            })
    })
};

const updateDocument = (collection, data, callback) => {
    MongoClient.connect(mongoUrl, function(error, db) {

        if(error) throw error;

        const ObjectId = require('mongodb').ObjectID;

        db.collection(collection).update(
            { [data.idKey] : ObjectId(data.id) },
            data.update, (error, response) => {
                if(error) throw error;
                db.close();
                if(typeof callback === "function") {
                    callback(response);
                }
            }
        );

    });
};