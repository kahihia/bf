/* global window document toastr _ jQuery */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import Glyphicon from './admin/components/glyphicon.jsx';
import AddPartnerForm from './admin/banners/add-partner-form.jsx';
import PartnerList from './admin/banners/partner-list.jsx';

(function () {
	'use strict';

	const AdminPartners = React.createClass({
		getInitialState() {
			return {
				isLoading: true,
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
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({partners: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список партнёров');
				}
			});
		},

		requestStaticGeneratorLanding() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/static-generator/landing/',
				method: 'POST',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 200) {
					toastr.success('Лэндинг успешно сгенерирован');
				} else {
					toastr.error('Не удалось сгенерировать лэндинг. Проверьте, что загружены партнёры и логотипы');
				}
			});
		},

		requestPartnerDelete(id) {
			this.setState({isLoading: true});

			xhr({
				url: `/api/partners/${id}/`,
				method: 'DELETE',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 204) {
					this.setState(previousState => {
						const partner = this.getPartnerById(id);
						previousState.partners = _.without(previousState.partners, partner);
						return previousState;
					});
				} else {
					toastr.error('Не удалось удалить партнёра');
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

		handleClickPartnerDelete(id) {
			if (window.confirm('Удалить партнёра?')) {
				this.requestPartnerDelete(id);
			}
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

		handleClickStaticGeneratorLanding() {
			this.requestStaticGeneratorLanding();
		},

		getPartnerById(id) {
			return _.find(this.state.partners, {id});
		},

		render() {
			const {isLoading} = this.state;

			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickPartnerAdd}
						type="button"
						>
						{'Добавить'}
					</button>

					{' '}

					<button
						className="btn btn-warning"
						onClick={this.handleClickStaticGeneratorLanding}
						disabled={isLoading}
						type="button"
						>
						<Glyphicon name="refresh"/>
						{' Сгенерировать лэндинг'}
					</button>

					<hr/>

					<PartnerList
						partners={this.state.partners}
						isLoading={isLoading}
						onClickPartnerDelete={this.handleClickPartnerDelete}
						onSubmitEdit={this.handleSubmitEdit}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-partners');
	ReactDOM.render(<AdminPartners/>, block);
})();
