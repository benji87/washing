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
        this.checkWebSocketConnection = this.checkWebSocketConnection.bind(this);
    }

    componentDidMount() {
        this.checkWebSocketConnection();
        setInterval(() => {
            this.checkWebSocketConnection();
        }, 30000);
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
                        <header className="app__header row d-flex align-items-center">
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
                                    icon="temperature"
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

