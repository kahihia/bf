/* global _ */

import React from 'react';
import {ADVERTISER_INNER_VALUES, MODERATION_STATUS} from '../const.js';
import FormRow from '../components/form-row.jsx';
import Radio from '../components/radio.jsx';
import Checkbox from '../components/checkbox.jsx';
import Select from '../components/select.jsx';
import PromoSelect from './promo-select.jsx';

class MerchantListFilter extends React.Component {
	constructor(props) {
		super(props);

		this.handleFilterByDate = this.handleFilterByDate.bind(this);
		this.handleFilterByName = this.handleFilterByName.bind(this);
		this.handleFilterByPromo = this.handleFilterByPromo.bind(this);
		this.handleFilterByModerationStatus = this.handleFilterByModerationStatus.bind(this);
		this.handleFilterByStatus = this.handleFilterByStatus.bind(this);
		this.handleFilterBySupernovaAdvertiser = this.handleFilterBySupernovaAdvertiser.bind(this);
		this.handleFilterByInnerAdvertiser = this.handleFilterByInnerAdvertiser.bind(this);
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

	handleFilterByModerationStatus(value) {
		value = parseInt(value, 10);
		if (isNaN(value)) {
			value = -1;
		}

		this.props.onFilterByModerationStatus(value);
	}

	handleFilterByStatus(value) {
		this.props.onFilterByStatus(value);
	}

	handleFilterBySupernovaAdvertiser(value) {
		this.props.onFilterBySupernovaAdvertiser(value);
	}

	handleFilterByInnerAdvertiser(value) {
		this.props.onFilterByInnerAdvertiser(value);
	}

	render() {
		const {
			filterByDate,
			filterByName,
			filterByPromo,
			filterByModerationStatus,
			filterByStatus,
			filterBySupernovaAdvertiser,
			filterByInnerAdvertiser
		} = this.props;
		const advertiserInnerOptions = _.union(
			[{id: '', name: '- особый признак -'}],
			_.map(ADVERTISER_INNER_VALUES, value => {
				return {
					id: value,
					name: value
				};
			})
		);
		const moderationStatusOptions = _.sortBy(
			_.union(
				[{id: -1, name: '- статус модерации -'}],
				_.map(MODERATION_STATUS, (value, key) => {
					return {
						id: key,
						name: value
					};
				})
			),
			'id'
		);

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
				<div className="row">
					<div className="col-sm-3">
						<div className="form-group">
							<Select
								options={advertiserInnerOptions}
								selected={filterByInnerAdvertiser}
								onChange={this.handleFilterByInnerAdvertiser}
								/>
						</div>
					</div>

					<div className="col-sm-3">
						<div className="form-group">
							<Checkbox
								text="Только «Сверхновая»"
								isChecked={filterBySupernovaAdvertiser}
								onChange={this.handleFilterBySupernovaAdvertiser}
								/>
						</div>
					</div>

					<div className="col-sm-3">
						<div className="form-group">
							<Select
								options={moderationStatusOptions}
								selected={filterByModerationStatus}
								onChange={this.handleFilterByModerationStatus}
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
	filterByModerationStatus: React.PropTypes.number,
	filterByStatus: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	filterBySupernovaAdvertiser: React.PropTypes.bool,
	filterByInnerAdvertiser: React.PropTypes.string,
	onFilterByDate: React.PropTypes.func,
	onFilterByName: React.PropTypes.func,
	onFilterByPromo: React.PropTypes.func,
	onFilterByModerationStatus: React.PropTypes.func,
	onFilterByStatus: React.PropTypes.func,
	onFilterBySupernovaAdvertiser: React.PropTypes.func,
	onFilterByInnerAdvertiser: React.PropTypes.func
};
MerchantListFilter.defaultProps = {
	filterByDate: 'ASC',
	filterByName: '',
	filterByPromo: '',
	filterByModerationStatus: '',
	filterByStatus: '',
	filterBySupernovaAdvertiser: false,
	filterByInnerAdvertiser: null
};

export default MerchantListFilter;
