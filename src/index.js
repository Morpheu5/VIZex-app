import _ from 'lodash'
import axios from 'axios'
import * as d3 from 'd3'
import * as d3Tip from 'd3-tip'
d3.tip = require('d3-tip')

import norm_css from '../assets/stylesheets/normalize.css'
import skel_css from '../assets/stylesheets/skeleton.css'
import style_css from '../assets/stylesheets/style.scss'

let graphBuilder = (data) => {
	let [width, height] = [960, 400];
	let margins = { v: 20, h: 20 };
	let step = width/data.values.length;
	let svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height);
	
	let graphBox = svg.append("g").attr("id", "graphBox").attr("transform", `translate(${step/4}, 0)`);
	
	let lines = graphBox.append("g").attr("transform", `translate(${step/4}, 0)`).selectAll("line").data(data.values).enter();
	let linesAttrs = lines.append("line")
	.attr("x1", (d, i) => { return i * step })
	.attr("x2", (d, i) => { return i * step })
	.attr("y1", (d, i) => { return height * (1 - d.low/data.highest) })
	.attr("y2", (d, i) => { return height * (1 - d.high/data.highest) })
	.attr("stroke", "black")
	.attr("stroke-width", 1)
	.exit();
	
	let tip = d3.tip().attr("class", "d3-tip").html((d) => { return `<span>open: ${d.open}</span><span>close: ${d.close}</span><span>${d.timestamp.toLocaleString()}</span>` })
	
	let boxes = graphBox.append("g").call(tip).selectAll("rect").data(data.values).enter();
	let boxesAttrs = boxes.append("rect")
	.attr("class", (d, i) => { return d.open > d.close ? "red" : "green" })
	.attr("x", (d, i) => { return i * step })
	.attr("width", step/2)
	.attr("y", (d, i) => { return d.open > d.close ? height * (1 - d.open/data.highest) : height * (1 - d.close/data.highest) })
	.attr("height", (d, i) => { return d.open > d.close ? height * (d.open-d.close) / data.highest : (height * (d.close-d.open) / data.highest) })
	.on("mouseover", tip.show)
	.on("mouseout", tip.hide)
	.exit();
	
	let x = d3.scaleTime().range([step/2, width-step/2]).domain([data.values[0].timestamp, data.values[data.values.length-1].timestamp]);
	let xAxis = d3.axisBottom().scale(x).ticks(data.values.length/3);
	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${height-margins.v*2})`)
	.call(xAxis);
	
	// let y = d3.scaleLinear().range([0, height-margins.v*2]).domain([data.highest, data.lowest]);
	// let yAxis = d3.axisRight().scale(y).ticks(height/100);
	// svg.append("g")
	// .attr("class", "y axis")
	// .attr("transform", `translate(0, ${0})`)
	// .call(yAxis);
	
	d3.select("#current-time").html(data.values[data.values.length-1].timestamp.toLocaleString());
	d3.select("#current-rate").html(data.values[data.values.length-1].close);
}

document.addEventListener("DOMContentLoaded", () => {
	let data = {};
	axios.get('http://localhost:8080/data')
	.then(function(response) {
		data = response.data;
		data.values = _.forEach(data.values, (d) => {
			d.timestamp = new Date(d.timestamp*1000);
		});
		graphBuilder(data);
	})
	.catch(function(error) {
		console.log(error);
		return false;
	});
});
