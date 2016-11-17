/* global window document Blob moment saveAs toastr */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import MailingBannersForm from './admin/mailing/mailing-banners-form.jsx';
import MailingTemplatePreview from './admin/mailing/mailing-template-preview.jsx';

(function () {
	'use strict';

	const AdminMailingBanners = React.createClass({
		getInitialState() {
			return {
				markup: '',
				incrementDisabled: false
			};
		},

		componentDidMount() {
			xhr({
				url: '/api/mailing/banners/',
				method: 'GET'
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					this.setState({markup: data});
				} else {
					toastr.error('Не удалось получить шаблон рассылки.');
				}
			});
		},

		handleRenderTemplate(data) {
			this.setState({
				markup: data,
				blob: new Blob([data], {type: 'text/html;charset=utf-8'})
			});
		},

		handleClickDownload() {
			const d = moment().format('D_MM_YYYY');

			saveAs(this.state.blob, `rbf_banner_${d}.html`);
		},

		handleIncrementCounters() {
			if (!this.state.incrementDisabled) {
				const msg = 'Значения счётчиков рассылок у магазинов будут увеличены.\n' +
							'Это действие повлияет на последующие рассылки, и его невозможно обратить.\n' +
							'Вы уверены?';

				if (window.confirm(msg)) {
					this.setState({
						incrementDisabled: true
					}, () => {
						xhr({
							url: '/api/mailing/banners/increment-counters/',
							method: 'POST',
							headers: {
								'X-CSRFToken': TOKEN.csrftoken
							}
						}, (err, resp) => {
							if (!err && resp.statusCode === 200) {
								toastr.success('Значения счётчиков рассылок у магазинов обновлены.');
							} else {
								toastr.error('Не удалось обновить значения счётчиков рассылок у магазинов.');
							}
							this.setState({incrementDisabled: false});
						});
					});
				}
			}
		},

		render() {
			const {markup} = this.state;
			const downloadEnabled = Boolean(markup);

			return (
				<div>
					<div className="form-group">
						<MailingBannersForm onRenderTemplate={this.handleRenderTemplate}/>
					</div>

					<div className="form-group">
						<h3>Предпросмотр</h3>
						<MailingTemplatePreview
							htmlstring={markup}
							downloadable={downloadEnabled}
							onClickDownload={this.handleClickDownload}
							/>
					</div>

					<div className="form-group">
						<button
							className="btn btn-danger"
							type="button"
							disabled={this.state.incrementDisabled}
							onClick={this.handleIncrementCounters}
							>
							Подтвердить совершение рассылки
						</button>
					</div>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-mailing-banners');
	ReactDOM.render(<AdminMailingBanners/>, block);
})();
