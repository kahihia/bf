const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const ENV = {
	production: 'production',
	development: 'development'
};

const isDev = process.env.NODE_ENV !== ENV.production;

module.exports = {
	entry: {
		app: './src/js/index.js'
	},
	output: {
		path: './static/dist',
		filename: '[name].js',
		publicPath: ''
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
								minimize: false,
								url: false,
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								// sourceMap: 'inline',
								plugins: function () {
									const plugins = [
										require('postcss-partial-import')(),
										require('postcss-custom-properties')(),
										require('autoprefixer')({cascade: false})
									];

									if (isDev) {
										return plugins;
									}

									plugins.push(
										require('postcss-csso')()
									);
									return plugins;
								}
							}
						}
					]
				})
			}
		]
	},
	resolve: {
		alias: {
			css: path.resolve(__dirname, 'src/css'),
			js: path.resolve(__dirname, 'src/js')
		}
	},
	plugins: (() => {
		const plugins = [];
		plugins.push(new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(isDev ? ENV.development : ENV.production)
		}));

		if (!isDev) {
			plugins.push(new UglifyJSPlugin());
			plugins.push(new webpack.LoaderOptionsPlugin({
				minimize: true
			}));
		}

		plugins.push(new ExtractTextPlugin({
			filename: '[name].css',
			allChunks: true
		}));

		return plugins;
	})(),
	devtool: isDev && 'cheap-module-source-map'
};
