/* global window toastr moment _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import Invoice from './invoice.jsx';

const AdvertiserInvoiceList = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			invoices: [],
			activeInvoiceId: null
		};
	},

	componentDidMount() {
		xhr({
			url: '/api/invoices/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data && Array.isArray(data)) {
					this.setState({invoices: sortByDate(data)});
					this.scrollToActiveInvoice();
				}
			}
		});
	},

	scrollToActiveInvoice() {
		const hash = window.location.hash;
		let activeInvoiceId;
		if (/invoice/.test(hash)) {
			activeInvoiceId = hash.split('invoice')[1];
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
		xhr({
			url: `/api/invoices/${id}/`,
			method: 'PATCH',
			json: {
				status: 2
			}
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				const invoice = this.getInvoiceById(id);
				invoice.status = 'canceled';
				invoice.status_name = 'Отменен';
				this.forceUpdate();
				toastr.success('Счёт был успешно аннулирован');
			} else {
				toastr.error('Не удалось аннулировать счёт');
			}
		});
	},

	handleClickPay(id, price) {
		xhr({
			url: '/payment/create',
			method: 'POST',
			json: {
				order_id: id,
				total_price: price
			}
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data.formUrl) {
					window.location = data.formUrl;
				}
			} else if (resp.statusCode === 400) {
				toastr.error(data);
			}
		});
	},

	getInvoiceById(id) {
		return _.find(this.state.invoices, {id});
	},

	render() {
		return (
			<div>
				{this.state.invoices.map(invoice => {
					return (
						<Invoice
							key={invoice.id}
							id={invoice.id}
							name={invoice.name}
							shopId={invoice.shop_id}
							createdAt={invoice.created_at}
							expired={invoice.expired}
							options={invoice.options}
							promo={invoice.promo}
							status={invoice.status}
							statusName={invoice.status_name}
							sum={invoice.sum}
							onCancel={this.handleInvoiceCancel}
							onClickPay={this.handleClickPay}
							active={String(invoice.id) === this.state.activeInvoiceId}
							/>
					);
				})}
			</div>
		);
	}
});

export default AdvertiserInvoiceList;

function sortByDate(data) {
	return _.sortBy(data, item => moment(item.created_at).valueOf()).reverse();
}
