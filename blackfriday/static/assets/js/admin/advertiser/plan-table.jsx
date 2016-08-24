/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import {resolveImgPath, formatPrice} from '../utils.js';
import Radio from '../components/radio.jsx';
import Icon from '../components/icon.jsx';

class PlanTable extends React.Component {
	constructor(props) {
		super(props);
		this.handleChangePlan = this.handleChangePlan.bind(this);
	}

	handleChangePlan(planId) {
		this.props.onChangePlan(planId);
	}

	render() {
		return (
			<table className="plan-table">
				<PlanTableHeader plans={this.props.plans}/>
				<PlanTableFooter
					plans={this.props.plans}
					activePlan={this.props.activePlan}
					onChangePlan={this.handleChangePlan}
					/>
				<PlanTableBody plans={this.props.plans}/>
			</table>
		);
	}
}
PlanTable.propTypes = {
	plans: React.PropTypes.array,
	activePlan: React.PropTypes.number,
	onChangePlan: React.PropTypes.func
};
PlanTable.defaultProps = {
};

export default PlanTable;

class PlanTableHeader extends React.Component {
	render() {
		return (
			<thead>
				<tr>
					<td>
						{'Пакеты'}
					</td>
					{this.props.plans.map(plan => {
						return (
							<th key={plan.id}>
								{plan.name}
							</th>
						);
					})}
				</tr>
			</thead>
		);
	}
}
PlanTableHeader.propTypes = {
	plans: React.PropTypes.array
};
PlanTableHeader.defaultProps = {
	plans: []
};

class PlanTableFooter extends React.Component {
	constructor() {
		super();
		this.handleChangePlan = this.handleChangePlan.bind(this);
	}

	handleChangePlan(planId) {
		this.props.onChangePlan(planId);
	}

	render() {
		return (
			<tfoot>
				<tr>
					<td>
						{'Стоимость'}
					</td>
					{this.props.plans.map(plan => {
						return (
							<td key={plan.id}>
								<Price
									cost={formatPrice(plan.price)}
									currency={'₽'}
									/>
							</td>
						);
					})}
				</tr>
				<tr>
					<td/>
					{this.props.plans.map(plan => {
						return (
							<td key={plan.id}>
								<Radio
									name={'Выбрать'}
									nameActive={'Выбрано'}
									value={plan.id}
									disabled={plan.disabled}
									isChecked={this.props.activePlan === plan.id}
									onChange={this.handleChangePlan}
									/>
							</td>
						);
					})}
				</tr>
			</tfoot>
		);
	}
}
PlanTableFooter.propTypes = {
	plans: React.PropTypes.array,
	activePlan: React.PropTypes.number,
	onChangePlan: React.PropTypes.func
};
PlanTableFooter.defaultProps = {
	plans: []
};

class PlanTableBody extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			items: this.collectAllItems(props)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({items: this.collectAllItems(nextProps)});
	}

	collectAllItems(props) {
		const items = {};

		props.plans.forEach(plan => {
			plan.items.forEach(item => {
				if (!items[item.id]) {
					items[item.id] = {
						id: item.id,
						image: item.image,
						name: item.name,
						plans: {}
					};
				}
				items[item.id].plans[plan.id] = {
					id: plan.id,
					value: item.value
				};
			});
		});

		return items;
	}

	render() {
		return (
			<tbody>
				{Object.keys(this.state.items).map(id => {
					const item = this.state.items[id];
					return (
						<tr key={item.id}>
							<td>
								<span className="plan-table__prop-label">
									{item.image ? (
										<span className="help-preview">
											<Icon name="plan-help"/>
											<img
												src={resolveImgPath(item.image, 'static')}
												alt=""
												/>
										</span>
									) : null}
									{item.name}
								</span>
							</td>
							{this.props.plans.map(plan => {
								const p = item.plans[plan.id];
								const value = p ? p.value : false;
								return (
									<td key={plan.id}>
										<span className="plan-table__prop-value">
											{planOptionValue(value)}
										</span>
									</td>
								);
							})}
						</tr>
					);
				})}
				<tr>
					<td>
						<span className="plan-table__prop-label">
							{'Трафик'}
						</span>
					</td>
					<td>
						<span className="plan-table__prop-value">
							<div className="plan-traff">
								<div
									className="plan-traff__progress"
									style={{
										width: '15%',
										background: '#f2d755'
									}}
									/>
							</div>
						</span>
					</td>
					<td>
						<span className="plan-table__prop-value">
							<div className="plan-traff">
								<div
									className="plan-traff__progress"
									style={{
										width: '30%',
										background: '#cff255'
									}}
									/>
							</div>
						</span>
					</td>
					<td>
						<span className="plan-table__prop-value">
							<div className="plan-traff">
								<div
									className="plan-traff__progress"
									style={{
										width: '50%',
										background: '#a3f255'
									}}
									/>
							</div>
						</span>
					</td>
					<td>
						<span className="plan-table__prop-value">
							<div className="plan-traff">
								<div
									className="plan-traff__progress"
									style={{
										width: '80%',
										background: '#4ec68a'
									}}
									/>
							</div>
						</span>
					</td>
				</tr>
			</tbody>
		);
	}
}
PlanTableBody.propTypes = {
	plans: React.PropTypes.array
};
PlanTableBody.defaultProps = {
};

function planOptionValue(value) {
	if (value === true) {
		return <Icon name="plan-true"/>;
	} else if (value === false) {
		return '—';
	}

	return <strong>{value}</strong>;
}
