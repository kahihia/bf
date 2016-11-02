/* global _ */
/* eslint no-useless-escape: 0 */

import React from 'react';
import {promoActions} from './promo-maker.jsx';

export default class PromoOption extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			isRegular: props.isRegular,
			included: props.included
		};

		this.handleInclude = this.handleInclude.bind(this);
		this.handleChangeValue = this.handleChangeValue.bind(this);
		this.handleChangePrice = this.handleChangePrice.bind(this);
	}

	handleInclude() {
		this.setState({
			included: !this.state.included
		}, function () {
			if (this.state.included) {
				let optionToInclude = {
					id: this.state.data.id,
					isRequired: this.props.isRegular,
					price: parseInt(this.state.data.value, 10) || null
				};

				if (this.props.isRegular) {
					if (this.state.data.isBoolean) {
						_.assign(optionToInclude, {
							value: 1
						});
					} else {
						_.assign(optionToInclude, {
							value: parseInt(this.state.data.value, 10) || null
						});
					}
				} else {
					_.assign(optionToInclude, {
						value: parseInt(this.state.data.value, 10) || null
					});
				}
				promoActions.optionIncluded(optionToInclude);
			} else {
				promoActions.optionExcluded({
					id: this.state.data.id,
					isRequired: this.props.isRegular
				});
			}
		});
	}

	handleChangeValue(event) {
		const value = parseInt(event.target.value, 10) || null;

		this.setState({
			data: Object.assign({}, this.state.data, {value: value})
		}, function () {
			let price;

			if (this.props.isRegular) {
				price = null;
			} else {
				price = parseInt(this.state.data.price, 10) || null;
			}

			promoActions.optionChanged({
				id: this.state.data.id,
				value: this.state.data.value,
				price: price,
				isRequired: this.props.isRegular
			});
		});
	}

	handleChangePrice(event) {
		const price = parseInt(event.target.value, 10) || null;

		this.setState({
			data: Object.assign({}, this.state.data, {price: price})
		}, function () {
			promoActions.optionChanged({
				id: this.state.data.id,
				value: this.state.data.value,
				price: this.state.data.price
			});
		});
	}

	render() {
		let display;

		if (this.state.data.isBoolean) {
			display = this.state.included ? (<i className="text-success glyphicon glyphicon-ok"/>) : '–';
		} else {
			display = (
				<input
					type="number"
					className="form-control"
					style={{fontSize: 14}}
					value={this.state.data.value}
					min="0"
					max={this.state.data.maxValue}
					disabled={!this.state.included}
					onChange={this.handleChangeValue}
					/>
			);
		}

		const priceInput = (
			<input
				type="text"
				className="form-control"
				style={{fontSize: 14}}
				pattern="\d+"
				disabled={!this.state.included}
				onChange={this.handleChangePrice}
				/>
		);

		return (
			<tr style={{height: this.props.rowHeight}}>
				<td className="text-center">
					<input type="checkbox" checked={this.state.included} onChange={this.handleInclude}/>
				</td>
				<td className="">
					{this.state.data.name}
				</td>
				<td className="text-center">
					{display}
				</td>
				<td className="">
					{(this.state.data.isBoolean || this.props.isRegular) ? null : priceInput}
				</td>
			</tr>
		);
	}
}

PromoOption.propTypes = {
	data: React.PropTypes.object,
	isRegular: React.PropTypes.bool,
	rowHeight: React.PropTypes.number,
	included: React.PropTypes.bool
};
PromoOption.defaultProps = {
	included: false
};
