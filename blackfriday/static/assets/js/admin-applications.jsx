/* global document toastr _ */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import FormRow from './admin/components/form-row.jsx';
import AdvertiserRequestList from './admin/leads/advertiser-request-list.jsx';

(function () {
	'use strict';

	const AdminApplications = React.createClass({
		getInitialState() {
			return {
				applications: [],
				applicationFilter: ''
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

		handleFilterApplication(e) {
			this.setState({applicationFilter: e.target.value});
		},

		render() {
			const {applications, applicationFilter} = this.state;

			let filteredApplications = applications;

			if (applicationFilter) {
				filteredApplications = _.filter(filteredApplications, item => {
					const {email, name, organizationName} = item;

					if (!name && !email && !organizationName) {
						return false;
					}

					return contains(applicationFilter, name) || contains(applicationFilter, email) || contains(applicationFilter, organizationName);
				});
			}

			return (
				<div>
					<div className="form">
						<FormRow
							label="Поиск заявки"
							placeholder="Email, Имя или Организация"
							value={applicationFilter}
							onChange={this.handleFilterApplication}
							/>
					</div>

					<AdvertiserRequestList
						applications={filteredApplications}
						onClickStatusChange={this.handleClickStatusChange}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-applications');
	ReactDOM.render(<AdminApplications/>, block);
})();

function contains(what, where) {
	if (!what || !where) {
		return;
	}

	if (where.toLowerCase().indexOf(what.toLowerCase()) > -1) {
		return true;
	}
	return false;
}
