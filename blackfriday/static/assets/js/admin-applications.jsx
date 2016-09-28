/* global document toastr _ */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {APPLICATION_STATUS, SORT_TYPES, TOKEN} from './admin/const.js';
import {reverseSortDirection} from './admin/utils.js';
import {getApplicationStatusColor} from './admin/leads/utils.js';
import FormCol from './admin/components/form-col.jsx';
import Checkbox from './admin/components/checkbox.jsx';
import AdvertiserRequestList from './admin/leads/advertiser-request-list.jsx';

const SORT_OPTIONS = {
	id: 'Дата',
	name: 'Имя',
	organizationName: 'Организация',
	email: 'Email',
	status: 'Статус',
	userResponsible: 'Менеджер'
};

const StatusList = () => (
	<table className="application-status-list">
		<tbody>
			<tr>
				<th>
					{'Статусы: '}
				</th>
				{_.map(APPLICATION_STATUS, (item, key) => {
					const color = getApplicationStatusColor(parseInt(key, 10));

					return (
						<td
							className={`text-${color} bg-${color}`}
							key={key}
							>
							{item}
						</td>
					);
				})}
			</tr>
		</tbody>
	</table>
);

(function () {
	'use strict';

	const AdminApplications = React.createClass({
		getInitialState() {
			return {
				applications: [],
				applicationFilter: '',
				sortKey: 'id',
				sortDir: SORT_TYPES.ASC,
				isLoading: false
			};
		},

		componentWillMount() {
			this.requestApplications();
		},

		requestApplications() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/applications/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

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
			this.setState({isLoading: true});

			xhr({
				url: `/api/applications/${id}/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: {status}
			}, (err, resp, data) => {
				this.setState({isLoading: false});

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

		handleSortKey(e) {
			this.setState({sortKey: e.target.value});
		},

		handleSortDir() {
			this.setState({sortDir: reverseSortDirection(this.state.sortDir)});
		},

		render() {
			const {applications, applicationFilter, sortDir, sortKey, isLoading} = this.state;

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

			if (sortKey) {
				filteredApplications = _.sortBy(filteredApplications, item => {
					if (typeof item[sortKey] === 'string') {
						return item[sortKey].toLowerCase();
					}

					return item[sortKey];
				});

				if (sortDir === SORT_TYPES.DESC) {
					filteredApplications.reverse();
				}
			}

			return (
				<div>
					<div className="form">
						<div className="form-group">
							<div className="row">
								<FormCol
									className="col-xs-6"
									label="Поиск заявки"
									placeholder="Email, Имя или Организация"
									value={applicationFilter}
									onChange={this.handleFilterApplication}
									disabled={isLoading}
									/>

								<FormCol
									className="col-xs-3"
									label="Сортировка"
									type="select"
									options={SORT_OPTIONS}
									value={sortKey}
									onChange={this.handleSortKey}
									disabled={isLoading}
									/>

								<span className="form-group col-xs-3">
									<span className="control-label">
										{' '}
									</span>

									<Checkbox
										text={'В обратном порядке'}
										name={'sortDirDESC'}
										isChecked={sortDir === SORT_TYPES.DESC}
										onChange={this.handleSortDir}
										disabled={isLoading}
										/>
								</span>
							</div>
						</div>
					</div>

					<StatusList/>

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
