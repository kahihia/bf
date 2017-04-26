/* global toastr _ */

import React from 'react';
import b from 'b_';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import ModerationItem from './moderation-item.jsx';

export class ModerationList extends React.Component {
	constructor() {
		super();
		this.state = {
			merchants: [],
			isLoading: true
		};

		this.handleClickApprove = this.handleClickApprove.bind(this);
		this.handleClickReject = this.handleClickReject.bind(this);

		this.requestMerchantsToModerate = this.requestMerchantsToModerate.bind(this);
		this.getMerchantById = this.getMerchantById.bind(this);
	}

	componentDidMount() {
		this.requestMerchantsToModerate();
	}

	requestMerchantsToModerate() {
		// 1 — статус "Ожидает модерации"
		xhr.get('/api/merchants/?moderation_status=1', {json: true}, (err, resp, data) => {
			this.setState({
				isLoading: false
			});

			if (!err && resp.statusCode === 200) {
				this.setState({
					merchants: data
				});
			} else {
				toastr.error('Не удалось получить список магазинов для модерации.');
			}
		});
	}

	getMerchantById(id) {
		return _.find(this.state.merchants, {id});
	}

	handleClickApprove(merchantId, comment) {
		this.setState({isLoading: true});

		const json = {
			status: 2,	// Подтверждён
			comment: comment
		};

		xhr({
			url: `/api/merchants/${merchantId}/moderation/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const merchant = this.getMerchantById(merchantId);
				merchant.moderation.status = data.status;
				merchant.moderation.comment = data.comment;
				this.forceUpdate();
				toastr.success('Магазин принят.');
			} else {
				toastr.error('Не удалось изменить статус модерации магазина.');
			}
		});
	}

	handleClickReject(merchantId, comment) {
		if (!comment) {
			return;
		}

		this.setState({isLoading: true});

		const json = {
			status: 3,	// Отклонён
			comment: comment
		};

		xhr({
			url: `/api/merchants/${merchantId}/moderation/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const merchant = this.getMerchantById(merchantId);
				merchant.moderation.status = data.status;
				merchant.moderation.comment = data.comment;
				this.forceUpdate();
				toastr.success('Магазин отклонён.');
			} else {
				toastr.error('Не удалось изменить статус модерации магазина.');
			}
		});
	}

	render() {
		const {merchants} = this.state;
		const className = 'moderation-list';

		let listStatus = null;

		if (!this.state.merchants.length) {
			if (this.state.isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Список на модерацию пуст';
			}
		}

		const statusRow = (
			<tr><td colSpan="4" className="text-center text-muted">{listStatus}</td></tr>
		);

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'logo'})}/>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Магазин'}
							</th>

							<th className={b(className, 'table-th', {name: 'comment'})}>
								{'Комментарий'}
							</th>

							<th className={b(className, 'table-th', {name: 'edit'})}/>
						</tr>
					</thead>

					<tbody>
						{merchants.map(item => {
							return (
								<ModerationItem
									key={item.id}
									merchant={item}
									onClickApprove={this.handleClickApprove}
									onClickReject={this.handleClickReject}
									/>
							);
						})}

						{listStatus ? statusRow : null}
					</tbody>
				</table>
			</div>
		);
	}
}
