import React, { Component } from 'react';
import './Weather.css';

const API = process.env.REACT_APP_API_URL;
const WEATHER_API = 'https://api.met.no/weatherapi/weathericon/1.1?';

class Weather extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isReady: false
        };
        this.getWeather = this.getWeather.bind(this);
        this.updateWeatherStatus = this.updateWeatherStatus.bind(this);
    }

    componentDidMount() {
        this.getWeather();
        setInterval(() => {
            this.getWeather();
        }, 900000);
    }

    getWeather() {
        fetch(API + 'weather')
            .then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }

                    if(response.ok) {
                        response.json().then((data) => {
                            this.setState({
                                precipitation: data[0].precipitation,
                                temperature: data[0].temperature,
                                wind_speed: data[0].wind_speed,
                                wind_direction: data[0].wind_direction,
                                cloudiness: data[0].cloudiness,
                                symbol: data[0].symbol,
                                isReady: true
                            });
                        });
                        this.updateWeatherStatus();
                    }
                }

            )
            .catch((err) => {
                console.log('Fetch Error :-S', err);
            })
    }

    updateWeatherStatus() {

        const weatherIcon = parseInt(this.state.symbol, 10);
        // Symbol values obtained from https://api.met.no/weatherapi/weathericon/1.1/documentation
        const good = [1,2,3];
        const ok = [4,5,6,7,8,40];

        let hangoutText;

        if (good.includes(weatherIcon)) {
            hangoutText = 'Forecast looks good to hang your washing out.';
        } else if (ok.includes(weatherIcon)) {
            hangoutText = 'It looks okay to hang the washing out, but be prepared!';
        } else {
            hangoutText = "Don't hang the washing out at the moment. ";
        }

        this.setState({
            hangoutText: hangoutText
        });

    }

    render() {

        const weatherIcon = `${ WEATHER_API }symbol=${ this.state.symbol }&content_type=image%2Fsvg`;

        return (
            <div>
                {this.state.isReady &&
                <div className="weather">
                    <div>
                        <img src={weatherIcon} alt="Weather Icon" className="weather__icon"/>
                    </div>
                    <div className="weather__content">
                        <h3 className="weather__content__heading">Weather forecast</h3>
                        <p className="weather__content__tip">{this.state.hangoutText}</p>
                    </div>

                </div>
                }
            </div>
        )
    }
}

export default Weather;