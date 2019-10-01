const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: ['./src/index.js'],
	output: {
		filename: 'js/app.js',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
			},
			{
				test: /\.(sass|scss)$/,
				use: [ 'style-loader', 'css-loader', 'sass-loader' ]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/env', '@babel/react']
					}
				}
			},
		]
	},
};