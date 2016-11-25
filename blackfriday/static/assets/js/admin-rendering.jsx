/* global window document toastr */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {processErrors} from './admin/utils.js';

(function () {
	'use strict';

	const AdminRendering = React.createClass({
		getInitialState() {
			return {
				isLoading: false
			};
		},

		requestGenerateAllPages() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/static-generator/all-pages/',
				method: 'POST',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				switch (resp.statusCode) {
					case 200: {
						toastr.success('Страницы были успешно созданы/обновлены');
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Страницы не были созданы/обновлены');
						break;
					}
				}
			});
		},

		handleClickGenerateAllPages() {
			if (window.confirm('После генерации всех статических страниц товарная витрина будет содержать рекламные материалы только тех магазинов, которые прошли модерацию. Вы уверены?')) {
				this.requestGenerateAllPages();
			}
		},

		render() {
			const {
				isLoading
			} = this.state;

			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickGenerateAllPages}
						type="button"
						disabled={isLoading}
						>
						{'Сгенерировать все страницы'}
					</button>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-rendering');
	ReactDOM.render(<AdminRendering/>, block);
})();
