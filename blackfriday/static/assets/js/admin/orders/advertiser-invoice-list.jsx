/* global window _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import {TOKEN} from '../const.js';
import {processErrors} from '../utils.js';
import Invoice from './invoice.jsx';

const AdvertiserInvoiceList = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			invoices: [],
			isLoading: true,
			activeInvoiceId: null
		};
	},

	componentDidMount() {
		xhr({
			url: '/api/invoices/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data && Array.isArray(data)) {
					const invoices = _.sortBy(data, 'id').reverse();
					this.setState({invoices});
					this.scrollToActiveInvoice();
				}
			}
		});
	},

	scrollToActiveInvoice() {
		const hash = window.location.hash;

		if (/invoice/.test(hash)) {
			let activeInvoiceId = hash.split('invoice')[1];

			if (activeInvoiceId) {
				this.setState({activeInvoiceId});
				Scroll.scroller.scrollTo(`anchor-invoice-${activeInvoiceId}`, {
					offset: -35,
					smooth: true
				});
			}
		}
	},

	handleInvoiceCancel(id) {
		if (window.confirm('Аннулировать счёт?')) {
			this.requestCancel(id);
		}
	},

	requestCancel(id) {
		const json = {status: 2};

		xhr({
			url: `/api/invoices/${id}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const invoice = this.getInvoiceById(id);
				invoice.status = 2;
				this.forceUpdate();
			} else if (statusCode === 400) {
				processErrors(data);
			} else {
				toastr.error('Не удалось аннулировать счёт');
			}
		});
	},

	requestPaymentCreate(invoiceId) {
		xhr({
			url: '/api/payments/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: {invoiceId}
		}, (err, resp, data) => {
			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				if (data.formUrl) {
					window.location = data.formUrl;
				}
			} else if (statusCode === 400 && data.message) {
				processErrors(data.message);
			} else {
				toastr.error('Не удалось создать счёт');
			}
		});
	},

	handleClickPay(invoiceId) {
		this.requestPaymentCreate(invoiceId);
	},

	getInvoiceById(id) {
		return _.find(this.state.invoices, {id});
	},

	render() {
		let listStatus = null;

		if (!this.state.invoices.length) {
			if (this.state.isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Счета отсутствуют';
			}
		}

		const statusBlock = (
			<div className="text-muted">
				{listStatus}
			</div>
		);

		return (
			<div>
				{this.state.invoices.map(invoice => (
					<Invoice
						key={invoice.id}
						id={invoice.id}
						merchant={invoice.merchant}
						createdDatetime={invoice.createdDatetime}
						promo={invoice.promo}
						status={invoice.status}
						options={invoice.options}
						sum={invoice.sum}
						onCancel={this.handleInvoiceCancel}
						onClickPay={this.handleClickPay}
						active={String(invoice.id) === this.state.activeInvoiceId}
						expiredDate={invoice.expiredDate}
						/>
				))}

				{listStatus ? statusBlock : null}
			</div>
		);
	}
});

export default AdvertiserInvoiceList;
