const { WEBSOCKET_PASS, WEBSOCKET_URL, MONGODB_URL } = require('./constants');

const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = MONGODB_URL;
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

app.get('/api/status', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Content-Type', 'application/json');

    let device = req.query.device;

    MongoClient.connect(mongoUrl, (err, db) => {
       if (err) throw err;
       const dbo = db.db("washing");
       const query = { device: device };
       dbo.collection("device").find(query).toArray((err, result) => {
           if (err) throw err;
           res.send(JSON.stringify(result));
           db.close();
       });
    });
});

app.get('/api/weather', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Content-Type', 'application/json');

    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        const dbo = db.db("washing");
        const query = { sensor: 'weather' };
        dbo.collection("stats").find(query).toArray((err, result) => {
            if (err) throw err;
            res.send(JSON.stringify(result));
            db.close();
        })
    })

});

app.listen(5000, () => console.log('Webhook server is listening, port 5000'));


const connect = () => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.on('open', function open() {
        console.log('open');

        ws.send(JSON.stringify({type:'auth', api_password:WEBSOCKET_PASS}), function ack(error) {
            if(error) {
                console.log("Error:" + error);
            }
        });
        ws.send(JSON.stringify({'id': 18, type: 'subscribe_events', event_type: 'state_changed'}), function ack(error) {
            if(error) {
                console.log("Error:" + error);
            }
        });
    });

    ws.on('error', function(error) {
        console.log(error);
    });

    ws.on('close', function close() {
        console.log('Websocket disconnected');

        const data = {
            query: {
                device: 'washing'
            },
            update: {
                $set: {
                    online: false
                }
            }
        };

        updateDocument('device', data, ()  => {
            console.log('1 document updated');
        });

        setTimeout(function(){connect()}, 5000);


    });

    ws.on('message', function incoming(data) {

        const response = JSON.parse(data);

        if(response.type == 'auth_ok') {

            const data = {
                query: {
                    device: 'washing'
                },
                update: {
                    $set: {
                        online: true
                    }
                }
            };

            updateDocument('device', data, ()  => {
                console.log('1 document updated');
                clearInterval(reconnect);
            });

        }

        if(response.type === 'event') {

            const device = 'washing';
            const weatherIdentifier = 'yr';

            if (typeof response.event.data.new_state.attributes.friendly_name !== 'undefined') {

                if(response.event.data.new_state.attributes.friendly_name.includes(device)) {

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
                        insertDocument('stats', data, () => {
                            console.log('Sensor state updated');
                        });
                    }
                }

                if(response.event.data.new_state.attributes.friendly_name.includes(weatherIdentifier)) {

                    console.log(response);

                    let entity = response.event.data.entity_id.split('.');
                    let state = response.event.data.new_state.state;
                    let timestamp = response.event.time_fired;

                    const data = {
                        query: {
                            sensor: 'weather'
                        },
                        update: {
                            $set: {
                                [entity[1].replace('yr_', '')]: state,
                                timestamp: timestamp
                            }
                        }
                    };

                    console.log(`${entity} ${state} ${timestamp} \n`);

                    updateDocument('stats', data, () => {
                        console.log('Weather report updated');
                    });
                }

            }
        }

    });

};


connect();


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

        const dbo = db.db("washing");

        dbo.collection(collection).updateOne(data.query, data.update, function (err, result) {
           if (err) throw err;
           console.log('1 document updated');
           db.close();
        });
    });
};