/* global window document toastr _ jQuery */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {hasRole} from './admin/utils.js';
import AddSpecialForm from './admin/specials/add-special-form.jsx';
import SpecialList from './admin/specials/special-list.jsx';

(function () {
	'use strict';

	const AdminSpecials = React.createClass({
		getInitialState() {
			return {
				isLoading: false,
				specials: []
			};
		},

		componentWillMount() {
			this.requestSpecials();
		},

		requestSpecials() {
			xhr({
				url: '/api/specials/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({specials: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список предложений партнёров.');
				}
			});
		},

		requestSpecialDelete(id) {
			this.setState({isLoading: true});

			xhr({
				url: `/api/specials/${id}/`,
				method: 'DELETE',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 204) {
					this.setState(previousState => {
						const special = this.getSpecialById(id);
						previousState.specials = _.without(previousState.specials, special);
						return previousState;
					});
				} else {
					toastr.error('Не удалось удалить предложение партнёра.');
				}
			});
		},

		handleClickSpecialAdd() {
			jQuery('#add-special-modal').modal('show');
			const onSubmit = special => {
				this.handleSpecialAdd(special);
				jQuery('#add-special-modal').modal('hide');
			};
			ReactDOM.render(
				<AddSpecialForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-special-form')
			);
		},

		handleSpecialAdd(special) {
			if (!special) {
				return;
			}

			this.setState(previousState => {
				previousState.specials.push(special);
				return previousState;
			});
		},

		handleClickSpecialDelete(id) {
			if (window.confirm('Удалить предложение партнёра?')) {
				this.requestSpecialDelete(id);
			}
		},

		handleSubmitEdit(data) {
			if (!data) {
				return;
			}

			this.setState(previousState => {
				const special = this.getSpecialById(data.id);
				_.merge(special, data);
				return previousState;
			});
		},

		getSpecialById(id) {
			return _.find(this.state.specials, {id});
		},

		render() {
			const isAdmin = hasRole('admin');

			return (
				<div>
					{isAdmin ? (
						<div>
							<button
								className="btn btn-success"
								onClick={this.handleClickSpecialAdd}
								type="button"
								>
								{'Добавить'}
							</button>

							<hr/>
						</div>
					) : null}

					<SpecialList
						specials={this.state.specials}
						isLoading={this.state.isLoading}
						onClickSpecialDelete={isAdmin && this.handleClickSpecialDelete}
						onSubmitEdit={isAdmin && this.handleSubmitEdit}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-specials');
	ReactDOM.render(<AdminSpecials/>, block);
})();
