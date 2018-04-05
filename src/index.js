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
// ^ I don't understand anything of the above.

// Fancy function to generate the d3 graph.
// Can I just say that d3 is horrible? Honestly, it's just a nanometrically
// thin coat of sugar away from building SVGs manually. I'm not sure what
// this is all about. I had a p5 implementation and I thought "hey, let's
// do this the fancy way" and I ended up with even more code!
const graphBuilder = (data) => {
	// This is genuinely cool. JS just got a quarter of a hair less icky.
	// debugger;
	const [width, height] = [Math.min(960, window.innerWidth), 400];
	const margins = { v: 20, h: 20 };
	const step = width/data.values.length;
	const lowest = data.lowest
	const highest = data.highest
	const hl_diff = highest - lowest
	
	// ^ This is pretty much self-explanatory, right?

	// The following is sheer madness.
	const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height);
	// Seriously, I'm just building an SVG document, here.
	// The string interpolation thing is neat. I just wish they didn't have to
	// use back ticks, I assume it's to not break legacy (read: GODAWFUL) code.
	const graphBox = svg.append("g").attr("id", "graphBox").attr("transform", `translate(${step/4}, 0)`);

	const lines = graphBox.append("g").attr("transform", `translate(${step/4}, 0)`).selectAll("line").data(data.values).enter();
	const linesAttrs = lines.append("line")
	.attr("x1", (d, i) => { return i * step })
	.attr("x2", (d, i) => { return i * step })
	.attr("y1", (d, i) => { return height * (1 - (d.low - lowest)/hl_diff ) })
	.attr("y2", (d, i) => { return height * (1 - (d.high - lowest)/hl_diff ) })
	.attr("stroke", "black")
	.attr("stroke-width", 1)
	.exit();
	
	const tip = d3.tip().attr("class", "d3-tip").html((d) => { return `<span>open: ${d.open}</span><span>close: ${d.close}</span><span>${d.timestamp.toLocaleString()}</span>` })
	
	const boxes = graphBox.append("g").call(tip).selectAll("rect").data(data.values).enter();
	const boxesAttrs = boxes.append("rect")
	.attr("class", (d, i) => { return d.open > d.close ? "red" : "green" })
	.attr("x", (d, i) => { return i * step })
	.attr("width", step/2)
	.attr("y", (d, i) => { return d.open > d.close ? height * (1 - (d.open-lowest) / hl_diff) : height * (1 - (d.close-lowest) / hl_diff) })
	.attr("height", (d, i) => { return d.open > d.close ? height * (d.open - d.close ) / hl_diff : (height * (d.close - d.open ) / hl_diff) })
	.on("mouseover", tip.show)
	.on("mouseout", tip.hide)
	.exit();
	
	const x = d3.scaleTime().range([step/2, width-step/2]).domain([data.values[0].timestamp, data.values[data.values.length-1].timestamp]);
	const xAxis = d3.axisBottom().scale(x).ticks(data.values.length/3);
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${height-margins.v*2})`)
	.call(xAxis);

	// When faking it, fake it well.
	d3.select("#current-time").html((new Date()).toLocaleString());
	d3.select("#current-rate").html(data.values[data.values.length-1].close);
};

// React is cool but weird.
class Calculator extends React.Component {
	constructor(props) {
		super(props);
		this.state = { rate: props.rate, viz: 1, btc: props.rate };

		this.viz2btc = this.viz2btc.bind(this);
		this.btc2viz = this.btc2viz.bind(this);
	}
		
	viz2btc(e) {
		let value = parseFloat(e.target.value);
		// Setting both values here because reasons...?
		this.setState({ viz: value, btc: _.round(value * this.state.rate, 4) })
	}
	
	btc2viz(e) {
		let value = parseFloat(e.target.value);
		// ... and here too.
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
	const url = process.env.NODE_ENV === 'production' ? 'https://api.vizex.co/data' : 'http://localhost:8080/data/1h/48';
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
