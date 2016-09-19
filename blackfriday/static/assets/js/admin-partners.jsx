/* global document toastr _ jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import AddPartnerForm from './admin/banners/add-partner-form.jsx';
import PartnerList from './admin/banners/partner-list.jsx';

(function () {
	'use strict';

	const AdminPartners = React.createClass({
		getInitialState() {
			return {
				partners: []
			};
		},

		componentWillMount() {
			this.requestPartners();
		},

		requestPartners() {
			xhr({
				url: '/api/partners/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({partners: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список партнёров');
				}
			});
		},

		handleClickPartnerAdd() {
			jQuery('#add-partner-modal').modal('show');
			const onSubmit = partner => {
				this.handlePartnerAdd(partner);
				jQuery('#add-partner-modal').modal('hide');
			};
			ReactDOM.render(
				<AddPartnerForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-partner-form')
			);
		},

		handlePartnerAdd(partner) {
			if (!partner) {
				return;
			}

			this.setState(previousState => {
				previousState.partners.push(partner);
				return previousState;
			});
		},

		handleSubmitEdit(data) {
			if (!data) {
				return;
			}

			this.setState(previousState => {
				const partner = this.getPartnerById(data.id);
				_.merge(partner, data);
				return previousState;
			});
		},

		getPartnerById(id) {
			return _.find(this.state.partners, {id});
		},

		render() {
			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickPartnerAdd}
						type="button"
						>
						{'Добавить'}
					</button>

					<hr/>

					<PartnerList
						partners={this.state.partners}
						onSubmitEdit={this.handleSubmitEdit}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-partners');
	ReactDOM.render(<AdminPartners/>, block);
})();
