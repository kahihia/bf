/* global jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';

class MailingTemplatePreview extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickDownload = this.handleClickDownload.bind(this);
	}

	componentDidMount() {
		this.updateIframeContent(this.props.htmlstring);
	}

	componentDidUpdate() {
		this.updateIframeContent(this.props.htmlstring);
	}

	updateIframeContent(html) {
		jQuery('iframe#mailing-preview').contents().find('html').html(html);
	}

	handleClickDownload() {
		if (this.props.onClickDownload) {
			this.props.onClickDownload();
		}
	}

	render() {
		const {htmlstring, downloadable} = this.props;
		const notAvailable = (
			<div>{'Предпросмотр недоступен'}</div>
		);

		return htmlstring ? (
			<div>
				<div className="form-group">
					<iframe
						id="mailing-preview"
						width={this.props.width}
						height={this.props.height}
						/>
				</div>

				{downloadable ? (
					<div className="form-group">
						<button
							className="btn btn-primary"
							type="button"
							onClick={this.handleClickDownload}
							>
							{'Скачать файл'}
						</button>
					</div>
				) : null}
			</div>
		) : notAvailable;
	}
}
MailingTemplatePreview.propTypes = {
	htmlstring: React.PropTypes.string,
	width: React.PropTypes.number,
	height: React.PropTypes.number,
	downloadable: React.PropTypes.bool,
	onClickDownload: React.PropTypes.func
};
MailingTemplatePreview.defaultProps = {
	width: 700,
	height: 1500,
	downloadable: false
};

export default MailingTemplatePreview;
