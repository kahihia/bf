/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import {formatPrice} from '../utils.js';
import Radio from '../components/radio.jsx';
import Icon from '../components/icon.jsx';

class PromoTable extends React.Component {
	constructor(props) {
		super(props);
		this.handleChangePromo = this.handleChangePromo.bind(this);
	}

	handleChangePromo(promoId) {
		this.props.onChangePromo(promoId);
	}

	render() {
		const {activePromoId, promos} = this.props;

		if (!promos) {
			return null;
		}

		return (
			<table className="promo-table">
				<PromoTableHeader promos={promos}/>

				<PromoTableFooter
					onChangePromo={this.handleChangePromo}
					{...{
						activePromoId,
						promos
					}}
					/>

				<PromoTableBody promos={promos}/>
			</table>
		);
	}
}
PromoTable.propTypes = {
	promos: React.PropTypes.array,
	activePromoId: React.PropTypes.number,
	onChangePromo: React.PropTypes.func
};
PromoTable.defaultProps = {
};

export default PromoTable;

class PromoTableHeader extends React.Component {
	render() {
		return (
			<thead>
				<tr>
					<td>
						{'Пакеты'}
					</td>

					{this.props.promos.map(promo => (
						<th key={promo.id}>
							{promo.name}
						</th>
					))}
				</tr>
			</thead>
		);
	}
}
PromoTableHeader.propTypes = {
	promos: React.PropTypes.array
};
PromoTableHeader.defaultProps = {
	promos: []
};

class PromoTableFooter extends React.Component {
	constructor() {
		super();
		this.handleChangePromo = this.handleChangePromo.bind(this);
	}

	handleChangePromo(promoId) {
		this.props.onChangePromo(promoId);
	}

	render() {
		const {activePromoId, promos} = this.props;

		return (
			<tfoot>
				<tr>
					<td>
						{'Стоимость'}
					</td>

					{promos.map(promo => (
						<td key={promo.id}>
							<Price
								cost={formatPrice(promo.price)}
								currency={'₽'}
								/>
						</td>
					))}
				</tr>

				<tr>
					<td/>

					{promos.map(promo => (
						<td key={promo.id}>
							<Radio
								name={'Выбрать'}
								nameActive={'Выбрано'}
								value={promo.id}
								disabled={promo.disabled}
								isChecked={activePromoId === promo.id}
								onChange={this.handleChangePromo}
								/>
						</td>
					))}
				</tr>
			</tfoot>
		);
	}
}
PromoTableFooter.propTypes = {
	promos: React.PropTypes.array,
	activePromoId: React.PropTypes.number,
	onChangePromo: React.PropTypes.func
};
PromoTableFooter.defaultProps = {
	promos: []
};

class PromoTableBody extends React.Component {
	constructor(props) {
		super(props);

		const {promos} = props;
		const options = this.collectAllOptions(promos);

		this.state = {options};
	}

	componentWillReceiveProps(nextProps) {
		const {promos} = nextProps;
		const options = this.collectAllOptions(promos);

		this.setState({options});
	}

	collectAllOptions(promos) {
		const options = {};

		promos.forEach(promo => {
			promo.options.forEach(item => {
				if (!options[item.id]) {
					options[item.id] = {
						id: item.id,
						image: item.image,
						name: item.name,
						promos: {}
					};
				}
				let value = item.value;
				if (item.isBoolean) {
					value = item.value !== 0;
				}
				options[item.id].promos[promo.id] = {
					id: promo.id,
					value
				};
			});
		});

		return options;
	}

	render() {
		const {options} = this.state;
		const {promos} = this.props;

		return (
			<tbody>
				{Object.keys(options).map(id => {
					const option = options[id];

					return (
						<tr key={option.id}>
							<td>
								<span className="promo-table__prop-label">
									{option.image ? (
										<span className="help-preview">
											<Icon name="promo-help"/>

											<img
												src={option.image}
												alt=""
												/>
										</span>
									) : null}

									{option.name}
								</span>
							</td>

							{promos.map(promo => {
								const p = option.promos[promo.id];
								const value = p ? p.value : false;

								return (
									<td key={promo.id}>
										<span className="promo-table__prop-value">
											{promoOptionValue(value)}
										</span>
									</td>
								);
							})}
						</tr>
					);
				})}

				<tr>
					<td>
						<span className="promo-table__prop-label">
							{'Трафик'}
						</span>
					</td>

					<td>
						<span className="promo-table__prop-value">
							<div className="promo-traff">
								<div
									className="promo-traff__progress"
									style={{
										width: '15%',
										background: '#f2d755'
									}}
									/>
							</div>
						</span>
					</td>

					<td>
						<span className="promo-table__prop-value">
							<div className="promo-traff">
								<div
									className="promo-traff__progress"
									style={{
										width: '30%',
										background: '#cff255'
									}}
									/>
							</div>
						</span>
					</td>

					<td>
						<span className="promo-table__prop-value">
							<div className="promo-traff">
								<div
									className="promo-traff__progress"
									style={{
										width: '50%',
										background: '#a3f255'
									}}
									/>
							</div>
						</span>
					</td>

					<td>
						<span className="promo-table__prop-value">
							<div className="promo-traff">
								<div
									className="promo-traff__progress"
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
PromoTableBody.propTypes = {
	promos: React.PropTypes.array
};
PromoTableBody.defaultProps = {
	promos: []
};

function promoOptionValue(value) {
	if (value === true) {
		return <Icon name="promo-true"/>;
	} else if (value === false) {
		return '—';
	}

	return <strong>{value}</strong>;
}
