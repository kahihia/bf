/* global toastr */

import React from 'react';
import xhr from 'xhr';

export default class MakeInvoiceBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			merchantId: props.merchantId,
			disabled: false,
			done: Boolean(props.done)
		};

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		let self = this;

		if (!self.state.disabled) {
			self.setState({
				disabled: true
			}, function () {
				xhr.post('/admin/invoices', {json: [self.state.merchantId]}, function (err, resp) {
					if (!err && (resp.statusCode === 200)) {
						self.setState({
							done: true
						}, function () {
							toastr.success('Счёт выставлен.');
						});
					} else {
						self.setState({
							disabled: false
						}, function () {
							toastr.error('Не удалось выставить счёт.');
						});
					}
				});
			});
		}
	}

	render() {
		if (this.state.done) {
			return (<span>{this.props.successMsg}</span>);
		}

		return (
			<button
				className="btn btn-default" type="button"
				disabled={this.state.disabled}
				onClick={this.handleClick}
				>
				Выставить счёт
			</button>
		);
	}
}

MakeInvoiceBtn.propTypes = {
	merchantId: React.PropTypes.number,
	done: React.PropTypes.bool,
	successMsg: React.PropTypes.string
};

MakeInvoiceBtn.defaultProps = {
	done: false,
	successMsg: 'Счёт выставлен'
};
