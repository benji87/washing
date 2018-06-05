import React, {Component} from 'react';
import {Line, defaults} from 'react-chartjs-2';

defaults.global.animation = false;
defaults.global.showLines = false;
defaults.global.response = true;
defaults.global.maintainAspectRatio = false;

const options = {
    legend: {
        display: false
    },
    tooltips: {
        enabled: true
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    display: false,
                    drawOnChartArea: false,
                    drawBorder: false,
                    tickMarkLength: 0
                },
                ticks: {
                    display: false
                }
            }
        ],
        yAxes: [
            {
                gridLines: {
                    display: false,
                    drawOnChartArea: false,
                    drawBorder: false,
                    tickMarkLength: 0
                },
                ticks: {
                    display: false
                }
            }
        ]
    }
};

class LineChart extends Component {

    render() {
        return (
            <div>
                <Line
                    data={this.props.chartData}
                    options={options}
                    height={70}
                />
            </div>
        )
    }
}

export default LineChart;