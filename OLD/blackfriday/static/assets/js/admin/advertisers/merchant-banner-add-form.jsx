/* global toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN, BANNER_TYPE} from '../const.js';
import Form from '../components/form.jsx';
import UTMWarningIcon from '../common/utm-warning-icon.jsx';
import ImageInfo from '../common/image-info.jsx';
import ImagesUpload from '../common/images-upload.jsx';
import Radio from '../components/radio.jsx';

class MerchantBannerAddForm extends Form {
	constructor(props) {
		super(props);
		const {availableBannerTypes} = props;
		const defaultBannerType = availableBannerTypes[0];

		this.state = {
			isLoading: false,
			fields: {
				type: {
					label: 'Размер',
					value: defaultBannerType,
					defaultValue: defaultBannerType,
					required: true
				},
				image: {
					label: 'Изображение',
					value: null,
					bannerTypes: {},
					defaultValue: null,
					required: true
				},
				url: {
					label: () => (
						<span>
							<UTMWarningIcon value={this.state.fields.url.value}/>
							{'URL'}
						</span>
					),
					value: '',
					type: 'url',
					required: true
				},
				onMain: {
					value: false,
					defaultValue: false
				},
				inMailing: {
					value: false,
					defaultValue: false
				},
				categories: {
					value: [],
					defaultValue: []
				}
			}
		};

		this.handleImagesUploadUpload = this.handleImagesUploadUpload.bind(this);
		this.handleChangeType = this.handleChangeType.bind(this);
		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const {availableBannerTypes} = nextProps;
		const defaultBannerType = availableBannerTypes[0];

		this.setState(previousState => {
			const type = previousState.fields.type;
			type.value = defaultBannerType;
			type.defaultValue = defaultBannerType;
			return previousState;
		});
	}

	requestMerchantBannerAdd() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const {merchantId} = this.props;
		const json = this.serialize();
		if (json.type === 20) {
			json.onMain = true;
		}

		xhr({
			url: `/api/merchants/${merchantId}/banners/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 201: {
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(data);
					}

					break;
				}
				case 400: {
					this.processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось загрузить баннер');
					break;
				}
			}
		});
	}

	handleImagesUploadUpload(data) {
		this.setState(previousState => {
			const {fields} = previousState;
			const {image, type} = fields;
			const bannerType = type.value;
			image.value = data.id;
			image.bannerTypes[bannerType] = data;
			return previousState;
		});
	}

	handleChangeType(value) {
		this.setState(previousState => {
			const {fields} = previousState;
			const {image, type} = fields;
			type.value = value;
			image.value = image.bannerTypes[value] ? image.bannerTypes[value].id : null;
			return previousState;
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestMerchantBannerAdd();
	}

	resetForm() {
		super.resetForm();

		this.setState(previousState => {
			const {image} = previousState.fields;
			image.bannerTypes = {};
			return previousState;
		});
	}

	render() {
		const {fields} = this.state;
		const bannerType = fields.type.value;
		const activeBanner = BANNER_TYPE[bannerType];
		const {image} = fields;
		const bannerTypeImage = image.bannerTypes[bannerType];
		const bannerTypeImageUrl = bannerTypeImage && bannerTypeImage.url;

		const {availableBannerTypes} = this.props;

		return (
			<div>
				<div className="modal-body">
					<form
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('url')}

						{availableBannerTypes.length > 1 ? availableBannerTypes.map(item => (
							<BannerTypeRadio
								key={item}
								type={item}
								isChecked={bannerType === item}
								onChange={this.handleChangeType}
								/>
						)) : null}

						{bannerTypeImageUrl ? (
							<img
								className="thumbnail img-responsive"
								src={bannerTypeImageUrl}
								alt=""
								/>
						) : null}

						<ImagesUpload
							onUpload={this.handleImagesUploadUpload}
							ext={['png', 'jpg']}
							width={activeBanner.width}
							height={activeBanner.height}
							exactSize
							/>
					</form>
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={this.state.isLoading || !this.validate()}
						type="button"
						>
						{'Загрузить'}
					</button>
				</div>
			</div>
		);
	}
}
MerchantBannerAddForm.propTypes = {
	availableBannerTypes: React.PropTypes.array.isRequired,
	merchantId: React.PropTypes.number.isRequired
};
MerchantBannerAddForm.defaultProps = {
};

export default MerchantBannerAddForm;

const BannerTypeRadio = props => {
	const {isChecked, onChange, type} = props;
	const banner = BANNER_TYPE[type];

	const Name = (
		<span>
			{banner.name}
			<BannerInfo type={type}/>
		</span>
	);

	return (
		<Radio
			name={Name}
			value={type}
			isChecked={isChecked}
			onChange={onChange}
			/>
	);
};
BannerTypeRadio.propTypes = {
	isChecked: React.PropTypes.bool,
	onChange: React.PropTypes.func,
	type: React.PropTypes.number.isRequired
};
// BannerTypeRadio.defaultProps = {};

const BannerInfo = props => {
	const banner = BANNER_TYPE[props.type];
	const ext = ['png', 'jpg'];

	return (
		<ImageInfo
			width={banner.width}
			height={banner.height}
			ext={ext}
			/>
	);
};
BannerInfo.propTypes = {
	type: React.PropTypes.number.isRequired
};
// BannerInfo.defaultProps = {};
