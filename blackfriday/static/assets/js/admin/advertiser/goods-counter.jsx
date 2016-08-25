/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import {getLimit} from './limits.js';

const GoodsCounter = React.createClass({
	propTypes: {
		count: React.PropTypes.number,
		countAdded: React.PropTypes.number
	},

	getInitialState() {
		return {
			count: 0,
			countAdded: 0
		};
	},

	getDefaultProps() {
		return {
			count: 0,
			countAdded: 0
		};
	},

	componentWillMount() {
		this.setState(this.props);
	},

	componentWillReceiveProps({countAdded}) {
		this.setState({countAdded});
	},

	calculateGoodsAllowed() {
		const defaultOptions = 50;
		const oneOption = 50;
		const limitOptions = defaultOptions + (oneOption * getLimit('additional_goods'));

		return limitOptions - this.calculateSum();
	},

	calculateSum() {
		return this.state.count + this.state.countAdded;
	},

	render() {
		return (
			<p>
				{'Загружено '}
				<strong>
					{this.calculateSum()}
				</strong>
				{' товара, ещё доступно '}
				<strong>
					{this.calculateGoodsAllowed()}
				</strong>
				{' товаров'}
			</p>
		);
	}
});

export default GoodsCounter;

export function renderGoodsCounter({count, countAdded}) {
	ReactDOM.render(<GoodsCounter {...{count, countAdded}}/>, document.getElementById('shop-goods-limit'));
}
