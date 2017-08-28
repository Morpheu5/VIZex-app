import _ from 'lodash';
import p5 from 'p5';
import axios from 'axios';

import norm_css from '../assets/stylesheets/normalize.css'
import skel_css from '../assets/stylesheets/skeleton.css'
import style_css from '../assets/stylesheets/style.scss'

var s = (sketch) => {
	
	sketch.data = {};
	
	sketch.setup = () => {
		sketch.createCanvas(600, 300);
		axios.get('http://localhost:8080/data')
			.then(function(response) {
				sketch.data = response.data;
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	sketch.draw = () => {
		sketch.background(240);
		sketch.stroke(0);
		sketch.strokeWeight(0);

		if(sketch.data.values) {
			let n = sketch.data.values.length;
			let lowest = sketch.data.lowest;
			let highest = sketch.data.highest;
			let diff = highest-lowest;
			let step = sketch.width/n;
			for(let i = 0; i < n; ++i) {
				let {open, high, low, close} = sketch.data.values[i];
				if(open > close) {
					sketch.fill(0,120,0);
				} else {
					sketch.fill(255,0,0);
				}
				sketch.rect(5+i*step, (high-lowest)*sketch.height/diff, 1, (high-low)*sketch.height/diff);
				sketch.rect(i*step, (open-lowest)*sketch.height/diff, 10, (open-close)*sketch.height/diff);
			}
		}
	};
};

document.addEventListener("DOMContentLoaded", () => {
	var myp5 = new p5(s, 'graph');
});
