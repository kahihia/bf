/* global document toastr _ */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import AdvertiserRequestList from './admin/leads/advertiser-request-list.jsx';

(function () {
	'use strict';

	const AdminApplications = React.createClass({
		getInitialState() {
			return {
				applications: []
			};
		},

		componentWillMount() {
			this.requestApplications();
		},

		requestApplications() {
			xhr({
				url: '/api/applications/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({applications: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список заявок');
				}
			});
		},

		requestChangeStatus(id, status) {
			xhr({
				url: `/api/applications/${id}/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: {status}
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						const application = this.getApplicationById(id);
						_.merge(application, data);
						this.forceUpdate();
					}
				} else {
					toastr.error('Не удалось получить список заявок');
				}
			});
		},

		handleClickStatusChange(id, status) {
			this.requestChangeStatus(id, status);
		},

		getApplicationById(id) {
			return _.find(this.state.applications, {id});
		},

		render() {
			return (
				<div>
					<AdvertiserRequestList
						applications={this.state.applications}
						onClickStatusChange={this.handleClickStatusChange}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-applications');
	ReactDOM.render(<AdminApplications/>, block);
})();
