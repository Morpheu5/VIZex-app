const webpack = require('webpack');
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            },
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
		contentBase: 'public',
		port: 8000,
	},
});