import React, { Component } from 'react';
import './App.css';
import StatPanel from './components/StatPanel/StatPanel';
import Weather from './components/Weather/Weather';

const API = process.env.REACT_APP_API_URL;

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            webSocketState: null
        };
        this.websocketConnection = this.websocketConnection.bind(this);
        this.handleSocketMessage = this.handleSocketMessage.bind(this);
        this.handleSensorUpdate = this.handleSensorUpdate.bind(this);
        this.checkWebSocketConnection = this.checkWebSocketConnection.bind(this);
    }

    componentDidMount() {
        this.checkWebSocketConnection();
        setInterval(() => {
            this.checkWebSocketConnection();
        }, 10000);
    }

    websocketConnection() {

        // const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
        //
        // // Connection opened
        // socket.addEventListener('open', function () {
        //
        //     //Websocket authorisation
        //     socket.send(JSON.stringify({type: 'auth', api_password: api_password}));
        //
        //     //Subscribe to events
        //     socket.send(JSON.stringify({'id': 18, type: 'subscribe_events', event_type: "state_changed"}));
        //
        //     //Get current states
        //     socket.send(JSON.stringify({'id': 19, type: 'get_states'}));
        //
        // });
        //
        // //Throw error if something goes wrong
        // socket.addEventListener('onerror', function (error) {
        //     console.log(error);
        // });
        //
        // //Listen for disconnection
        // socket.addEventListener('onclose', this.setState({haConnection: false, webSocketState: socket.readyState}));
        //
        // // Listen for messages
        // socket.addEventListener('message', this.handleSocketMessage);

    }

    handleSocketMessage(event) {

        // let response = JSON.parse(event.data);
        //
        // console.log(response);
        //
        // switch(response.type) {
        //     case 'auth_invalid':
        //         console.log('Incorrect login credentials');
        //         break;
        //     case 'auth_ok':
        //         this.setState({ haConnection: true });
        //         break;
        //     case 'event':
        //         this.handleSensorUpdate(response);
        //         break;
        //     case 'result':
        //         if(response.id === 19) {
        //             console.log('getting all states');
        //             console.log(response);
        //
        //             this.setState({
        //                 device: {
        //                     ...this.state.device,
        //                     states: {
        //                         ...this.state.device.states,
        //                         online: response.result[124].state,
        //                         temperature: response.result[147].state,
        //                         vibration: response.result[149].state
        //                     }
        //                 },
        //                 weather: {
        //                     temperature: response.result[48].state,
        //                     wind_speed: response.result[49].state,
        //                     wind_direction: response.result[50].state,
        //                     cloud_cover: response.result[51].state
        //                 }
        //             })
        //         }
        //         break;
        //     // no default
        // }

    }

    handleSensorUpdate(response) {

        // //console.log('handle sensor update called');
        //
        // //Update sensors for defined device
        // if(typeof response.event.data.new_state.attributes.friendly_name !== 'undefined' && response.event.data.new_state.attributes.friendly_name.includes(this.state.device.name)) {
        //
        //     //console.log('defined device sensor change');
        //
        //     const sensor = response.event.data.new_state.attributes.friendly_name.split(' ');
        //     const listenForSensors = ['power', 'current', 'energy', 'voltage', 'online', 'vibration'];
        //
        //     if (listenForSensors.includes(sensor[1])) {
        //         //console.log(response);
        //
        //         let consumption = response.event.data.new_state.state;
        //         let unit_of_measurement = response.event.data.new_state.attributes.unit_of_measurement;
        //
        //         //console.log(`${sensor[1]} ${consumption} ${unit_of_measurement}`);
        //
        //         this.setState({
        //             device: {
        //                 ...this.state.device,
        //                 states: {
        //                     ...this.state.device.states,
        //                     [sensor[1]]: `${consumption}${unit_of_measurement}`
        //                 }
        //             }
        //         })
        //     }
        // }
    }

    checkWebSocketConnection() {
        fetch(API + 'status?device=washing')
            .then(
                (response) => {
                    if(response.status !== 200) {
                        console.log(`Looks like there was a problem. Status code: ${response.status}`);
                        return;
                    }

                    response.json().then((data) => {
                        this.setState({ webSocketState: data[0].online });
                    })
                }
            )
            .catch((err) => {
                console.log(`Fetch error :-S, ${err}`);
            });
    };



    render() {
        return (
            <div className="app">
                { this.state.webSocketState ? (
                    <div className="container">
                        <header className="row">
                            <div className="col-xs-12 col-md-7">
                                <div className="app__title">
                                    <h1>Washing Machine Monitor</h1>
                                </div>
                            </div>
                            <div className="col-xs-12 col-md-5">
                                <Weather />
                            </div>
                        </header>
                        <div className="row">
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="power"
                                    title="Power"
                                    icon="power"
                                    unit_of_measurement="W"
                                    showStatus
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="vibration"
                                    title="Vibration"
                                    icon="vibration"
                                    unit_of_measurement="mercalli"
                                    showStatus
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="temperature"
                                    title="Ambient Temperature"
                                    icon="power"
                                    unit_of_measurement="&deg;C"
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="voltage"
                                    title="Voltage"
                                    icon="power"
                                    unit_of_measurement="V"
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="current"
                                    title="Current"
                                    icon="power"
                                    unit_of_measurement="A"
                                />
                            </div>
                            <div className="col-xs-12 col-md-6">
                                <StatPanel
                                    stat="energy"
                                    title="Energy"
                                    icon="power"
                                    unit_of_measurement="kWh"
                                    showStatus
                                />
                            </div>
                        </div>
                        <div>
                            {/*Washing machine status: {this.state.device.states.online}*/}
                        </div>
                    </div>
                ) : (
                    <div className="app__connection animated fadeIn">
                        <h3>{this.state.webSocketState === null ? 'Establishing connection...' : 'Connection lost. Attempting to re-connect...'}</h3>
                    </div>
                    )}

            </div>
        );
    }
}

export default App;

