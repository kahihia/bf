/* eslint react/require-optimization: 0 */

import React from 'react';
import FormRow from '../components/form-row.jsx';
import Radio from '../components/radio.jsx';
import PromoSelect from './promo-select.jsx';

class MerchantListFilter extends React.Component {
	constructor(props) {
		super(props);

		this.handleFilterByDate = this.handleFilterByDate.bind(this);
		this.handleFilterByName = this.handleFilterByName.bind(this);
		this.handleFilterByPromo = this.handleFilterByPromo.bind(this);
		this.handleFilterByStatus = this.handleFilterByStatus.bind(this);
	}

	handleFilterByDate(value) {
		this.props.onFilterByDate(value);
	}

	handleFilterByName(e) {
		this.props.onFilterByName(e.target.value);
	}

	handleFilterByPromo(value) {
		this.props.onFilterByPromo(value);
	}

	handleFilterByStatus(value) {
		this.props.onFilterByStatus(value);
	}

	render() {
		const {
			filterByDate,
			filterByName,
			filterByPromo,
			filterByStatus
		} = this.props;

		return (
			<div className="form">
				<div className="row">
					<div className="col-sm-3">
						<FormRow
							label="Название"
							value={filterByName}
							onChange={this.handleFilterByName}
							/>
					</div>

					<div className="col-sm-3">
						<div className="form-group">
							<div className="control-label">
								{'Дата создания'}
							</div>

							<Radio
								name="Сначала новые"
								value="ASC"
								isChecked={filterByDate === 'ASC'}
								onChange={this.handleFilterByDate}
								/>

							<Radio
								name="Сначала старые"
								value="DESC"
								isChecked={filterByDate === 'DESC'}
								onChange={this.handleFilterByDate}
								/>
						</div>
					</div>

					<div className="col-sm-3">
						<div className="form-group">
							<div className="control-label">
								{'Статус оплаты'}
							</div>

							<Radio
								name="Все"
								value=""
								isChecked={filterByStatus === ''}
								onChange={this.handleFilterByStatus}
								/>

							<Radio
								name="Оплачен"
								value={1}
								isChecked={filterByStatus === 1}
								onChange={this.handleFilterByStatus}
								/>

							<Radio
								name="Не оплачен"
								value={0}
								isChecked={filterByStatus === 0}
								onChange={this.handleFilterByStatus}
								/>
						</div>
					</div>

					<div className="col-sm-3">
						<div className="form-group">
							<div className="control-label">
								{'Рекламный пакет'}
							</div>

							<PromoSelect
								value={filterByPromo}
								onChange={this.handleFilterByPromo}
								/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
MerchantListFilter.propTypes = {
	filterByDate: React.PropTypes.oneOf(['ASC', 'DESC']),
	filterByName: React.PropTypes.string,
	filterByPromo: React.PropTypes.number,
	filterByStatus: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	onFilterByDate: React.PropTypes.func,
	onFilterByName: React.PropTypes.func,
	onFilterByPromo: React.PropTypes.func,
	onFilterByStatus: React.PropTypes.func
};
MerchantListFilter.defaultProps = {
	filterByDate: 'ASC',
	filterByName: '',
	filterByPromo: '',
	filterByStatus: ''
};

export default MerchantListFilter;
