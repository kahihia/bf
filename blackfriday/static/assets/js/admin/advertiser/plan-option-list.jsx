import React from 'react';
import Price from 'react-price';
import DecInc from 'react-decinc';
import {resolveImgPath, formatPrice} from '../utils.js';
import Radio from '../components/radio.jsx';
import Icon from '../components/icon.jsx';

const PlanOptionList = React.createClass({
	propTypes: {
		options: React.PropTypes.array,
		onCheck: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	handleChange(id, value) {
		this.props.onChange(id, value);
	},

	handleCheck(id, isChecked) {
		this.props.onCheck(id, isChecked);
	},

	render() {
		return (
			<table className="plan-option-list">
				<tbody>
					{this.props.options.map(option => {
						return (
							<PlanOptionListItem
								key={option.id}
								{...option}
								onChange={this.handleChange}
								onCheck={this.handleCheck}
								/>
						);
					})}
				</tbody>
			</table>
		);
	}
});

export default PlanOptionList;

const PlanOptionListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		value: React.PropTypes.number,
		minValue: React.PropTypes.number,
		available: React.PropTypes.number,
		price: React.PropTypes.number,
		image: React.PropTypes.string,
		isActive: React.PropTypes.bool,
		required: React.PropTypes.bool,
		onCheck: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	handleChange(value) {
		this.props.onChange(this.props.id, value);
	},

	handleCheck() {
		if (this.props.required) {
			return;
		}

		this.props.onCheck(this.props.id, !this.props.isActive);
	},

	render() {
		return (
			<tr>
				<td>
					<span className="plan-option-list__prop-label">
						{this.props.image ? (
							<span className="help-preview">
								<Icon name="plan-help"/>
								<img
									src={resolveImgPath(this.props.image, 'static')}
									alt=""
									/>
							</span>
						) : null}
						{this.props.name}
					</span>
				</td>
				<td className="plan-option-list__col-value">
					{this.props.price === null ? null : (
						<DecInc
							value={this.props.value || 0}
							min={this.props.minValue || 0}
							max={this.props.available || 11}
							onChange={this.handleChange}
							/>
					)}
				</td>
				<td className="plan-option-list__col-price">
					{this.props.price === null ? (
						<span>
							{'По запросу'}
						</span>
					) : (
						<div>
							<Price
								cost={formatPrice(this.props.price)}
								currency={'₽'}
								/>
							<Radio
								name={'Выбрать'}
								nameActive={'Выбрано'}
								value={this.props.id}
								isChecked={this.props.isActive}
								onChange={this.handleCheck}
								/>
						</div>
					)}
				</td>
			</tr>
		);
	}
});
