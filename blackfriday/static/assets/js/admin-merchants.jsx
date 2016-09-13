/* global document toastr _ */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import MerchantsList from './admin/advertisers/merchants-list.jsx';

(function () {
	'use strict';

	const AdminMerchants = React.createClass({
		getInitialState() {
			return {
				merchants: []
			};
		},

		componentWillMount() {
			this.requestMerchants();
		},

		requestMerchants() {
			xhr({
				url: '/api/merchants/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({merchants: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список магазинов');
				}
			});
		},

		getMerchantById(id) {
			return _.find(this.state.merchants, {id});
		},

		render() {
			const {merchants} = this.state;

			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleAddClick}
						type="button"
						>
						{'Добавить'}
					</button>

					<hr/>

					<MerchantsList
						merchants={merchants}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchants');
	ReactDOM.render(<AdminMerchants/>, block);
})();
