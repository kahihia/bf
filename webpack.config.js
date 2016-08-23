/* eslint quote-props: ["error", "as-needed"] */
/* eslint camelcase: ["error", {properties: "never"}] */

'use strict';

const path = require('path');
const webpack = require('webpack');
const args = require('minimist')(process.argv.slice(2));
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const bootstrap = require('bootstrap-styl');
const rupture = require('rupture');
const autoprefixer = require('autoprefixer-stylus');

const PATH_SRC = path.join(__dirname, 'blackfriday', 'static', 'assets');
const PATH_DIST = path.join(__dirname, 'blackfriday', 'static', 'static', 'build');

// env: 'dev', 'dist'
let env;
if (args.env) {
	env = args.env;
} else {
	env = 'dev';
}

// Default plugins
let plugins = [
	new SpritesmithPlugin({
		src: {
			cwd: path.resolve(PATH_SRC, 'sprite'),
			glob: '*.png'
		},
		target: {
			image: path.resolve(PATH_SRC, 'styles/spritesmith-generated/sprite.png'),
			css: path.resolve(PATH_SRC, 'styles/spritesmith-generated/sprite.styl')
		},
		apiOptions: {
			cssImageRef: '~sprite.png'
		}
	}),
	// Save CSS as external file
	new ExtractTextPlugin('[name].css', {allChunks: true})
];

if (env === 'dev') {
	// Development plugins
	plugins = plugins.concat([
	]);
} else if (env === 'dist') {
	// Dist plugins
	plugins = plugins.concat([
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, output: {comments: false}}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.NoErrorsPlugin()
	]);
}

module.exports = {
	entry: {
		admin: path.resolve(PATH_SRC, 'js/admin.jsx'),
		app: path.resolve(PATH_SRC, 'js/app.jsx'),
		auth: path.resolve(PATH_SRC, 'js/auth.jsx')
	},
	output: {
		path: PATH_DIST,
		filename: '[name].js',
		publicPath: '/static/static/'
	},
	module: {
		preLoaders: [
			// Lint JS
			{
				test: /\.(js|jsx)$/,
				loader: 'eslint-loader',
				exclude: [/node_modules/]
			}
		],
		loaders: [
			// JS
			{
				test: /\.(js|jsx)$/,
				loader: 'babel-loader'
			},
			// CSS
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.styl/,
				loader: ExtractTextPlugin.extract('style-loader', 'css-loader!stylus-loader'),
				exclude: /node_modules/
			},
			// Sprites
			{
				test: /\.png/,
				loaders: ['file?name=sprites/[name].[ext]'],
				exclude: /node_modules/
			}
		]
	},
	stylus: {
		use: [
			bootstrap(),
			rupture(),
			autoprefixer()
		]
	},
	eslint: {
		configFile: path.join(__dirname, '.eslintrc')
	},
	devtool: 'cheap-module-source-map',
	plugins: plugins,
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		moment: 'moment',
		toastr: 'toastr',
		lodash: '_',
		jquery: 'jQuery'
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.styl'],
		modulesDirectories: ['node_modules', 'spritesmith-generated'],
		alias: {
			styles: path.resolve(PATH_SRC, 'styles'),
			node_modules: path.join(__dirname, 'node_modules')
		},
		root: [PATH_SRC]
	}
};
