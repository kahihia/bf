/* global document, Blob, moment, saveAs, toastr */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import MailingBannersForm from './admin/mailing/mailing-banners-form.jsx';
import MailingTemplatePreview from './admin/mailing/mailing-template-preview.jsx';

(function () {
	'use strict';

	const AdminMailingBanners = React.createClass({
		getInitialState() {
			return {
				markup: ''
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
				</div>
			);
		}
	});

	const block = document.getElementById('admin-mailing-banners');
	ReactDOM.render(<AdminMailingBanners/>, block);
})();
