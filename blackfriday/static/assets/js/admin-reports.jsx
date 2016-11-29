/* global document toastr _ saveAs Blob */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import xhr from 'xhr';
import Glyphicon from './admin/components/glyphicon.jsx';

(function () {
	'use strict';

	const AdminReports = React.createClass({
		getInitialState() {
			return {
				isLoading: false,
				merchants: []
			};
		},

		componentWillMount() {
			this.requestMerchants();
		},

		requestMerchants() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/merchants/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 200) {
					if (data) {
						const merchants = _.sortBy(data, 'id');
						this.setState({merchants});
					}
				} else {
					toastr.error('Не удалось получить список магазинов');
				}
			});
		},

		render() {
			const {
				isLoading,
				merchants
			} = this.state;
			const className = 'merchant-list';

			let listStatus = null;
			if (!merchants.length) {
				if (isLoading) {
					listStatus = 'Загрузка...';
				} else {
					listStatus = 'Магазины отсутствуют';
				}
			}

			const statusRow = (
				<tr>
					<td
						colSpan="4"
						className="text-center text-muted"
						>
						{listStatus}
					</td>
				</tr>
			);

			return (
				<div className={b(className)}>
					<table className={'table table-hover ' + b(className, 'table')}>
						<thead>
							<tr>
								<th className={b(className, 'table-th', {name: 'logo'})}>
									{'Логотип'}
								</th>

								<th className={b(className, 'table-th', {name: 'name'})}>
									{'Название'}
								</th>

								<th className={b(className, 'table-th', {name: 'advertiser'})}>
									{'Рекламодатель'}
								</th>

								<th className={b(className, 'table-th', {name: 'action'})}/>
							</tr>
						</thead>

						<tbody>
							{merchants.map(item => (
								<MerchantListItem
									key={item.id}
									{...item}
									/>
							))}

							{listStatus ? statusRow : null}
						</tbody>
					</table>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-reports');
	ReactDOM.render(<AdminReports/>, block);
})();

class MerchantListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			id,
			advertiser,
			image,
			name
		} = this.props;

		const className = 'merchant-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'logo'})}>
					<span className={b(className, 'logo-placeholder')}>
						{image ? (
							<img
								src={image.url}
								alt=""
								/>
						) : null}
					</span>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'advertiser'})}>
					{advertiser.name}
				</td>

				<td className={b(className, 'table-td', {name: 'action'})}>
					<MerchantReportActButton
						merchantId={id}
						merchantName={name}
						/>

					<MerchantReportStatisticsButton
						merchantId={id}
						merchantName={name}
						/>

					<MerchantReportVisualButton
						merchantId={id}
						merchantName={name}
						/>
				</td>
			</tr>
		);
	}
}
MerchantListItem.propTypes = {
	advertiser: React.PropTypes.object,
	id: React.PropTypes.number,
	image: React.PropTypes.object,
	name: React.PropTypes.string,
	onClickMerchantReportStatistics: React.PropTypes.func,
	onClickMerchantReportAct: React.PropTypes.func
};
// MerchantListItem.defaultProps = {};

class MerchantReportActButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.handleClick = this.handleClick.bind(this);
	}

	requestMerchantReportAct() {
		this.setState({isLoading: true});
		const {
			merchantId,
			merchantName
		} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/act-report/`,
			method: 'GET',
			responseType: 'arraybuffer'
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const blob = new Blob([data], {type: 'application/pdf;charset=utf-8'});
				saveAs(blob, `Акт-отчет об оказании услуг - ${merchantName}.pdf`);
			} else {
				toastr.error('Не удалось получить акт-отчет об оказании услуг');
			}
		});
	}

	handleClick() {
		this.requestMerchantReportAct();
	}

	render() {
		return (
			<button
				className="btn btn-default btn-sm btn-block"
				onClick={this.handleClick}
				type="button"
				disabled={this.state.isLoading}
				>
				<Glyphicon name="download-alt"/>
				{' Акт-отчёт об оказании услуг'}
			</button>
		);
	}
}
MerchantReportActButton.propTypes = {
	merchantId: React.PropTypes.number.isRequired,
	merchantName: React.PropTypes.string.isRequired
};
// MerchantReportActButton.defaultProps = {};

class MerchantReportStatisticsButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.handleClick = this.handleClick.bind(this);
	}

	requestMerchantReportStatistics() {
		this.setState({isLoading: true});
		const {
			merchantId,
			merchantName
		} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/statistics-report/`,
			method: 'GET',
			responseType: 'arraybuffer'
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const blob = new Blob([data], {type: 'application/pdf;charset=utf-8'});
				saveAs(blob, `Статистика размещения рекламных материалов - ${merchantName}.pdf`);
			} else {
				toastr.error('Не удалось получить статистику размещения рекламных материалов');
			}
		});
	}

	handleClick() {
		this.requestMerchantReportStatistics();
	}

	render() {
		return (
			<button
				className="btn btn-primary btn-sm btn-block"
				onClick={this.handleClick}
				type="button"
				disabled={this.state.isLoading}
				>
				<Glyphicon name="download-alt"/>
				{' Статистика размещения рекламных материалов'}
			</button>
		);
	}
}
MerchantReportStatisticsButton.propTypes = {
	merchantId: React.PropTypes.number.isRequired,
	merchantName: React.PropTypes.string.isRequired
};
// MerchantReportStatisticsButton.defaultProps = {};

class MerchantReportVisualButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.handleClick = this.handleClick.bind(this);
	}

	requestMerchantReportVisual() {
		this.setState({isLoading: true});
		const {
			merchantId,
			merchantName
		} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/visual-report/`,
			method: 'GET',
			responseType: 'arraybuffer'
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const blob = new Blob([data], {type: 'application/pdf;charset=utf-8'});
				saveAs(blob, `Отчет о визуальном размещении рекламных материалов - ${merchantName}.pdf`);
			} else {
				toastr.error('Не удалось получить отчет о визуальном размещении рекламных материалов');
			}
		});
	}

	handleClick() {
		this.requestMerchantReportVisual();
	}

	render() {
		return (
			<button
				className="btn btn-warning btn-sm btn-block"
				onClick={this.handleClick}
				type="button"
				disabled={this.state.isLoading}
				>
				<Glyphicon name="download-alt"/>
				{' Отчет о визуальном размещении рекламных материалов'}
			</button>
		);
	}
}
MerchantReportVisualButton.propTypes = {
	merchantId: React.PropTypes.number.isRequired,
	merchantName: React.PropTypes.string.isRequired
};
