/* global moment */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import b from 'b_';
import {getApplicationStatusColor} from './utils.js';

const AdvertiserRequestList = React.createClass({
	getInitialState() {
		return {};
	},

	propTypes: {
		applications: React.PropTypes.array,
		onClickStatusChange: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickStatusChange(id, status) {
		this.props.onClickStatusChange(id, status);
	},

	render() {
		const {applications} = this.props;

		const className = 'advertiser-request-list';

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'date'})}>
								{'Дата'}
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Имя'}
							</th>

							<th className={b(className, 'table-th', {name: 'organization'})}>
								{'Организация'}
							</th>

							<th className={b(className, 'table-th', {name: 'email'})}>
								{'Email'}
							</th>

							<th className={b(className, 'table-th', {name: 'phone'})}>
								{'Телефон'}
							</th>

							<th className={b(className, 'table-th', {name: 'comment'})}>
								{'Комментарий'}
							</th>

							<th className={b(className, 'table-th', {name: 'manager'})}>
								{'Менеджер'}
							</th>

							<th className={b(className, 'table-th', {name: 'action'})}/>
						</tr>
					</thead>

					<tbody>
						{applications.map(item => {
							return (
								<AdvertiserRequestListItem
									key={item.id}
									onClickStatusChange={this.handleClickStatusChange}
									{...item}
									/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

export default AdvertiserRequestList;

const AdvertiserRequestListItem = React.createClass({
	propTypes: {
		comment: React.PropTypes.string,
		createdDatetime: React.PropTypes.string,
		email: React.PropTypes.string,
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		onClickStatusChange: React.PropTypes.func,
		organizationName: React.PropTypes.string,
		phone: React.PropTypes.string,
		status: React.PropTypes.number,
		updatedDatetime: React.PropTypes.string,
		userResponsible: React.PropTypes.object
	},

	getDefaultProps() {
		return {};
	},

	handleClickStatusChange(e) {
		e.preventDefault();
		this.props.onClickStatusChange(this.props.id, parseInt(e.target.dataset.status, 10));
	},

	render() {
		const {
			comment,
			createdDatetime,
			email,
			name,
			organizationName,
			phone,
			status,
			updatedDatetime,
			userResponsible
		} = this.props;
		const className = 'advertiser-request-list';

		return (
			<tr className={b(className, 'table-tr') + getApplicationStatusColor(status, ' bg-')}>
				<td className={b(className, 'table-td', {name: 'date'})}>
					<div title="Дата создания">
						{moment(createdDatetime).format('DD.MM.YYYY')}
					</div>

					<div title="Дата обновления">
						{moment(updatedDatetime).format('DD.MM.YYYY')}
					</div>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'organization'})}>
					{organizationName}
				</td>

				<td className={b(className, 'table-td', {name: 'email'})}>
					<a href={`mailto:${email}`}>
						{email}
					</a>
				</td>

				<td className={b(className, 'table-td', {name: 'phone'})}>
					{phone}
				</td>

				<td className={b(className, 'table-td', {name: 'comment'})}>
					{comment}
				</td>

				<td className={b(className, 'table-td', {name: 'manager'})}>
					{userResponsible ? (
						userResponsible.displayName
					) : null}
				</td>

				<td className={b(className, 'table-td', {name: 'action'})}>
					{status === 0 || status === 10 ? (
						<div style={{height: '5px'}}/>
					) : null}

					{status === 0 ? (
						<button
							className="btn btn-sm btn-block"
							onClick={this.handleClickStatusChange}
							data-status="10"
							type="button"
							>
							{'В работу'}
						</button>
					) : null}

					{status === 10 ? (
						<button
							className="btn btn-success btn-sm btn-block"
							onClick={this.handleClickStatusChange}
							data-status="20"
							type="button"
							>
							{'Участвует'}
						</button>
					) : null}

					{status === 10 ? (
						<button
							className="btn btn-danger btn-sm btn-block"
							onClick={this.handleClickStatusChange}
							data-status="30"
							type="button"
							>
							{'Отказ'}
						</button>
					) : null}
				</td>
			</tr>
		);
	}
});
