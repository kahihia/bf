/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {promoActions} from './promo-list.jsx';

export default class MakeManyInvoicesBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			merchantIds: props.merchantIds,
			disabled: props.disabled
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			disabled: nextProps.disabled,
			merchantIds: nextProps.merchantIds
		});
	}

	handleClick() {
		let self = this;

		if (!self.state.disabled) {
			self.setState({
				disabled: true
			}, function () {
				xhr.post('/admin/invoices', {json: self.state.merchantIds}, function (err, resp) {
					self.setState({
						disabled: false
					}, function () {
						if (!err && (resp.statusCode === 200)) {
							toastr.success('Счёт выставлен.');
							promoActions.allUnselected(true /* stop */);
						} else {
							toastr.error('Не удалось выставить счёт.');
						}
					});
				});
			});
		}
	}

	render() {
		return (
			<button
				className="btn btn-default" type="button"
				disabled={this.state.disabled}
				onClick={this.handleClick}
				>
				Выставить счёт для выбранных
			</button>
		);
	}
}

MakeManyInvoicesBtn.propTypes = {
	merchantIds: React.PropTypes.array,
	disabled: React.PropTypes.bool
};

MakeManyInvoicesBtn.defaultProps = {
	disabled: false
};
