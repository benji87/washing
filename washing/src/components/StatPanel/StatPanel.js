import React, { Component } from 'react';
import LineChart from '../LineChart/LineChart';
import './StatPanel.css';
import VibrationIcon from '../../img/vibration.svg';
import PowerIcon from '../../img/power.svg';
import TemperatureIcon from '../../img/temperature.svg';

const API = process.env.REACT_APP_API_URL + 'stats?stat=';

class StatPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
            sensorValue: null,
            sensorStatus: null,
            numResults: 10,
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: this.props.stat,
                        fill: true,
                        lineTension: 0.1,
                        backgroundColor: 'rgba(236,240,250,.8)',
                        borderColor: 'rgba(47,96,206,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 6,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: 'rgba(47,96,206,1)',
                        pointHoverBorderColor: 'rgba(255,255,255,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        data: []
                    }
                ]
            }
        };
        this.fetchChartData = this.fetchChartData.bind(this);
        this.updateSensorStatus = this.updateSensorStatus.bind(this);
        this.handleIcon = this.handleIcon.bind(this);
    }

    componentDidMount() {

        this.fetchChartData();

        setInterval(() => {
            this.fetchChartData();
        }, 10000);

    }

    fetchChartData() {
        fetch(API + `${this.props.stat}&numResults=${this.state.numResults}`)
            .then(
                (response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }

                    if(response.ok) {
                        response.json().then((result) => {

                            let itemsProcessed = 0;
                            let data = [];
                            let labels = [];

                            result.forEach((element) => {

                                let label = new Date(element.timestamp);
                                let value = element.state;

                                labels.unshift(label);
                                data.unshift(value);
                                itemsProcessed++;

                            });
                            if (itemsProcessed === result.length) {
                                this.setState({
                                    isReady: true
                                })
                            }
                            this.setState({
                                sensorValue: data[data.length - 1],
                                chartData: {
                                    labels: labels,
                                    datasets: [
                                        {
                                            ...this.state.chartData.datasets[0],
                                            data: data
                                        }
                                    ]
                                }
                            }, () => {
                                this.updateSensorStatus();
                            });
                        });
                    }
                }
            )
            .catch((err) => {
                console.log('Fetch Error :-S', err);
            });
    }

    updateSensorStatus() {

        let sensorReading = this.state.sensorValue;
        let sensorStatus = null;

        switch(this.props.stat) {
            case 'power':
                switch (true) {
                    case (sensorReading > 2500):
                        sensorStatus = 'Attention';
                        break;
                    case (sensorReading > 1000 && sensorReading < 2500):
                        sensorStatus = 'Heating water';
                        break;
                    case (sensorReading > 250 && sensorReading < 1000):
                        sensorStatus = 'Spinning';
                        break;
                    case (sensorReading > 5 && sensorReading < 350):
                        sensorStatus = 'Wash';
                        break;
                    default:
                        sensorStatus = 'Idle';
                        break;
                }
                this.setState({sensorStatus: sensorStatus});
            break;
            case 'energy':
                switch (true) {
                    case (sensorReading > 16):
                        sensorStatus = 'Attention';
                        break;
                    case (sensorReading > 13.5 && sensorReading < 16):
                        sensorStatus = 'Wash';
                        break;
                    default:
                        sensorStatus = 'Idle';
                        break;
                }
                this.setState({sensorStatus: sensorStatus});
            break;
            case 'vibration':
                switch (true) {
                    case (sensorReading > 11):
                        sensorStatus = 'Attention';
                        break;
                    case (sensorReading > 2.5 && sensorReading < 11):
                        sensorStatus = 'Spinning';
                        break;
                    case (sensorReading > 1 && sensorReading < 2.5):
                        sensorStatus = 'Wash';
                        break;
                    default:
                        sensorStatus = 'Idle';
                        break;
                }
                this.setState({sensorStatus: sensorStatus});
            break;
            // no default
        }
    }

    handleIcon() {

        let icon;

        switch(this.props.icon) {
            case 'power':
                icon = PowerIcon;
                break;
            case 'vibration':
                icon = VibrationIcon;
                break;
            case 'temperature':
                icon = TemperatureIcon;
                break;
            default:
                icon = PowerIcon;
        }

        return icon;
    }

    render() {

        return (
            <div>
                {this.state.isReady ? (
                    <div className="stat-panel">
                        {this.props.showStatus &&
                        <div className={"stat-panel__status preloader" + (this.state.sensorStatus === 'Attention' ? ' stat-panel__status--attention animated infinite flash' : '')}>{this.state.sensorStatus}</div>
                        }
                        <div className="stat-panel__info">
                            <img src={this.handleIcon()} alt="Icon" className="stat-panel__icon" />
                            <div className="stat-panel__content">
                                <h3 className="stat-panel__heading preloader">{this.props.title}</h3>
                                <div className="stat-panel__stat preloader">{this.state.sensorValue}<span className="stat-panel__stat__measurement">{this.props.unit_of_measurement}</span></div>
                            </div>
                        </div>
                        <div className="stat-panel__chart">
                            <LineChart chartData={this.state.chartData}/>
                        </div>
                    </div>
                ) : (
                    <div className="stat-panel">
                        <div className="stat-panel__loading">Loading panel&hellip;</div>
                    </div>
                    )
                }
            </div>
        )
    }
}

export default StatPanel;
