import _ from 'lodash'
import axios from 'axios'
import * as d3 from 'd3'
import * as d3Tip from 'd3-tip'
d3.tip = require('d3-tip')

import * as React from 'react'
import ReactDOM from 'react-dom'

import norm_css from '../assets/stylesheets/normalize.css'
import skel_css from '../assets/stylesheets/skeleton.css'
import style_css from '../assets/stylesheets/style.scss'

const graphBuilder = (data) => {
	const [width, height] = [960, 400];
	const margins = { v: 20, h: 20 };
	const step = width/data.values.length;
	const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height);
	
	const graphBox = svg.append("g").attr("id", "graphBox").attr("transform", `translate(${step/4}, 0)`);
	
	const lines = graphBox.append("g").attr("transform", `translate(${step/4}, 0)`).selectAll("line").data(data.values).enter();
	const linesAttrs = lines.append("line")
	.attr("x1", (d, i) => { return i * step })
	.attr("x2", (d, i) => { return i * step })
	.attr("y1", (d, i) => { return height * (1 - d.low / data.highest) })
	.attr("y2", (d, i) => { return height * (1 - d.high / data.highest) })
	.attr("stroke", "black")
	.attr("stroke-width", 1)
	.exit();
	
	const tip = d3.tip().attr("class", "d3-tip").html((d) => { return `<span>open: ${d.open}</span><span>close: ${d.close}</span><span>${d.timestamp.toLocaleString()}</span>` })
	
	const boxes = graphBox.append("g").call(tip).selectAll("rect").data(data.values).enter();
	const boxesAttrs = boxes.append("rect")
	.attr("class", (d, i) => { return d.open > d.close ? "red" : "green" })
	.attr("x", (d, i) => { return i * step })
	.attr("width", step/2)
	.attr("y", (d, i) => { return d.open > d.close ? height * (1 - d.open / data.highest) : height * (1 - d.close / data.highest) })
	.attr("height", (d, i) => { return d.open > d.close ? height * (d.open - d.close) / data.highest : (height * (d.close - d.open) / data.highest) })
	.on("mouseover", tip.show)
	.on("mouseout", tip.hide)
	.exit();
	
	const x = d3.scaleTime().range([step/2, width-step/2]).domain([data.values[0].timestamp, data.values[data.values.length-1].timestamp]);
	const xAxis = d3.axisBottom().scale(x).ticks(data.values.length/3);
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${height-margins.v*2})`)
	.call(xAxis);
	
	d3.select("#current-time").html(data.values[data.values.length-1].timestamp.toLocaleString());
	d3.select("#current-rate").html(data.values[data.values.length-1].close);
};

class Calculator extends React.Component {
	constructor(props) {
		super(props);
		this.state = { rate: props.rate, viz: 1, btc: props.rate };

		this.viz2btc = this.viz2btc.bind(this);
		this.btc2viz = this.btc2viz.bind(this);
	}
		
	viz2btc(e) {
		let value = parseFloat(e.target.value);
		this.setState({ viz: value, btc: _.round(value * this.state.rate, 4) })
	}
	
	btc2viz(e) {
		let value = parseFloat(e.target.value);
		this.setState({ btc: value, viz: _.round(value / this.state.rate, 4) })
	}
	
	render() {
		return (<div>
			<div className="three columns">
				<label htmlFor="viz">VIZ</label>
				<input className="u-full-width" type="number" min="0" name="viz" value={this.state.viz} onChange={this.viz2btc} />
			</div>
			<div className="three columns">
				<label htmlFor="btc">BTC</label>
				<input className="u-full-width" type="number" min="0" name="btc" value={this.state.btc} onChange={this.btc2viz} />
			</div>
		</div>);
	}
};

document.addEventListener("DOMContentLoaded", () => {
	const url = process.env.NODE_ENV === 'production' ? 'https://api.vizex.co/data' : 'http://localhost:8080/data';
	axios.get(url)
	.then(function(response) {
		let data = response.data;
		data.values = _.forEach(data.values, (d) => {
			d.timestamp = new Date(d.timestamp*1000);
		});
        let rate = data.values[data.values.length-1].close;
		graphBuilder(data);
        
        ReactDOM.render(
			<Calculator rate={rate} />,
			document.getElementById("calculator")
		);
	})
	.catch(function(error) {
		console.log(error);
		return false;
	});
});
