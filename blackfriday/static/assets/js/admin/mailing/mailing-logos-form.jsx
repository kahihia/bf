/* global toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN, REGEXP} from '../const.js';
import Form from '../components/form.jsx';
import ImagesUpload from '../common/images-upload.jsx';
import Checkbox from '../components/checkbox.jsx';

class MailingLogosForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				topBanner: {
					label: 'Баннер сверху',
					value: null,
					bannerTypes: {},
					defaultValue: null,
					required: false
				},
				topBannerUrl: {
					label: 'Ссылка',
					type: 'url',
					pattern: REGEXP.url,
					value: '',
					required: false
				},
				middleBanner: {
					label: 'Баннер посередине',
					value: null,
					bannerTypes: {},
					defaultValue: null,
					required: false
				},
				middleBannerUrl: {
					label: 'Ссылка с баннера посередине',
					type: 'url',
					pattern: REGEXP.url,
					value: '',
					required: false
				},
				topText: {
					label: 'Текст',
					type: 'textarea',
					value: '',
					required: false
				},
				bottomText: {
					label: 'Текст',
					value: '',
					required: false
				},
				bottomTextUrl: {
					label: 'Ссылка',
					type: 'url',
					pattern: REGEXP.url,
					value: '',
					required: false
				},
				includeAdmitad: {
					type: 'checkbox',
					text: 'Включить логотипы со ссылками на AdmitAd',
					value: false
				}
			},
			previews: {
				topBanner: null,
				middleMabber: null
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
		this.handleTopBannerUpload = this.handleTopBannerUpload.bind(this);
		this.handleClickRemoveTopBanner = this.handleClickRemoveTopBanner.bind(this);
		this.handleMiddleBannerUpload = this.handleMiddleBannerUpload.bind(this);
		this.handleClickRemoveMiddleBanner = this.handleClickRemoveMiddleBanner.bind(this);
		this.handleChangeIncludeAdmitad = this.handleChangeIncludeAdmitad.bind(this);
	}

	reformatData(data) {
		let result = {
			includeAdmitad: data.includeAdmitad || false
		};

		if (data.topBanner && data.topBannerUrl) {
			result.topBanner = {
				id: data.topBanner,
				url: data.topBannerUrl
			};
		}
		if (data.middleBanner && data.middleBannerUrl) {
			result.middleBanner = {
				id: data.middleBanner,
				url: data.middleBannerUrl
			};
		}
		if (data.topText) {
			result.topText = data.topText;
		}
		if (data.bottomText && data.bottomTextUrl) {
			result.bottomText = {
				text: data.bottomText,
				url: data.bottomTextUrl
			};
		}

		return result;
	}

	requestPostMailingData() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.reformatData(this.serialize());

		xhr({
			url: '/api/mailing/logos/',
			method: 'POST',
			headers: {
				'Accept': 'text/html',
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (this.props.onRenderTemplate) {
					this.props.onRenderTemplate(data);
				}
			} else {
				toastr.error('Не удалось сгенерировать шаблон рассылки с переданными данными.');
			}
		});
	}

	handleTopBannerUpload(data) {
		this.setState(prevState => {
			prevState.fields.topBanner.value = data.id;
			prevState.previews.topBanner = data.url;
			prevState.fields.topBannerUrl.required = true;
			return prevState;
		});
	}

	handleClickRemoveTopBanner() {
		this.setState(prevState => {
			prevState.fields.topBanner.value = null;
			prevState.previews.topBanner = '';
			prevState.fields.topBannerUrl.required = false;
			return prevState;
		});
	}

	handleMiddleBannerUpload(data) {
		this.setState(prevState => {
			prevState.fields.middleBanner.value = data.id;
			prevState.previews.middleBanner = data.url;
			prevState.fields.middleBannerUrl.required = true;
			return prevState;
		});
	}

	handleClickRemoveMiddleBanner() {
		this.setState(prevState => {
			prevState.fields.middleBanner.value = null;
			prevState.previews.middleBanner = '';
			prevState.fields.middleBannerUrl.required = false;
			return prevState;
		});
	}

	handleChangeIncludeAdmitad(value) {
		this.setState(prevState => {
			prevState.fields.includeAdmitad.value = value;
			return prevState;
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestPostMailingData();
	}

	render() {
		const topBannerDimensions = {
			width: 570,
			height: 225
		};
		const middleBannerDimensions = {
			width: 620,
			height: 245
		};

		return (
			<form
				action=""
				onSubmit={this.handleClickSubmit}
				>

				<h3>Верхний баннер</h3>

				<div className="form-group">
					<ImagesUpload
						onUpload={this.handleTopBannerUpload}
						ext={['png', 'jpg']}
						width={topBannerDimensions.width}
						height={topBannerDimensions.height}
						exactSize
						/>
				</div>

				{this.state.previews.topBanner ? (
					<div className="form-group" style={{position: 'relative'}}>
						<img
							className="thumbnail thumbnail-200 img-responsive"
							src={this.state.previews.topBanner}
							alt=""
							/>
						<button
							type="button"
							className="close"
							style={{left: 200}}
							aria-label="Close"
							onClick={this.handleClickRemoveTopBanner}
							>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				) : null}

				{this.buildRow('topBannerUrl')}

				<h3>Текст</h3>

				{this.buildRow('topText')}

				<h3>Средний баннер</h3>

				<div className="form-group">
					<ImagesUpload
						onUpload={this.handleMiddleBannerUpload}
						ext={['png', 'jpg']}
						width={middleBannerDimensions.width}
						height={middleBannerDimensions.height}
						exactSize
						/>
				</div>

				{this.state.previews.middleBanner ? (
					<div className="form-group" style={{position: 'relative'}}>
						<img
							className="thumbnail thumbnail-200 img-responsive"
							src={this.state.previews.middleBanner}
							alt=""
							/>
						<button
							type="button"
							className="close"
							style={{left: 200}}
							aria-label="Close"
							onClick={this.handleClickRemoveMiddleBanner}
							>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				) : null}

				{this.buildRow('middleBannerUrl')}

				<h3>Кнопка внизу</h3>

				{this.buildRow('bottomText')}
				{this.buildRow('bottomTextUrl')}

				<h3>Логотипы</h3>
				<div className="form-group">
					<Checkbox
						text={this.state.fields.includeAdmitad.text}
						isChecked={this.state.fields.includeAdmitad.value}
						onChange={this.handleChangeIncludeAdmitad}
						/>
				</div>

				<button
					className="btn btn-primary"
					onClick={this.handleClickSubmit}
					disabled={this.state.isLoading || !this.validate()}
					type="button"
					>
					{'Сгенерировать'}
				</button>
			</form>
		);
	}
}
MailingLogosForm.propTypes = {
	onRenderTemplate: React.PropTypes.func
};

export default MailingLogosForm;
