/* global window document jQuery _ toastr */
/* eslint-disable no-alert */
/* eslint react/require-optimization: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import xhr from 'xhr';
import {BANNER_TYPE, BANNER_LIMIT_ALIAS, TOKEN} from '../const.js';
import {processErrors} from '../utils.js';
import ImageInfo from '../common/image-info.jsx';
import MerchantBanner from './merchant-banner.jsx';
import MerchantBannerAddForm from './merchant-banner-add-form.jsx';

const className = 'merchant-banner-list';

class MerchantBannerList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			banners: []
		};

		this.handleClickBannerAdd = this.handleClickBannerAdd.bind(this);
		this.handleCheckOnMain = this.handleCheckOnMain.bind(this);
		this.handleCheckInMailing = this.handleCheckInMailing.bind(this);
		this.handleChangeUrl = this.handleChangeUrl.bind(this);
		this.handleChangeCategories = this.handleChangeCategories.bind(this);
		this.handleClickDelete = this.handleClickDelete.bind(this);
		this.handleUploadImage = this.handleUploadImage.bind(this);
	}

	componentWillMount() {
		this.requestBanners();
	}

	requestBanners() {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/banners/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					const banners = _.sortBy(data, 'type');
					this.setState({banners}, () => {
						this.props.onChange(banners);
					});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось получить список баннеров');
					break;
				}
			}
		});
	}

	requestBannerUpdate(bannerId, props) {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		let banner = this.getBannerById(bannerId);
		const json = _.pick(_.cloneDeep(banner), ['type', 'url', 'onMain', 'inMailing']);
		json.image = banner.image.id;
		json.categories = banner.categories.map(item => item.id);
		_.assign(json, props);

		xhr({
			url: `/api/merchants/${merchantId}/banners/${bannerId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					this.merchantBannerUpdate(bannerId, data);
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось изменить баннер');
					break;
				}
			}
		});
	}

	requestBannerDelete(bannerId) {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/banners/${bannerId}/`,
			method: 'DELETE',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 204: {
					this.merchantBannerDelete(bannerId);
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось удалить баннер');
					break;
				}
			}
		});
	}

	openMerchantBannerAddModal(availableBannerTypes) {
		jQuery('#merchant-banner-add-modal').modal('show');
		const {merchantId} = this.props;
		const onSubmit = data => {
			jQuery('#merchant-banner-add-modal').modal('hide');
			this.merchantBannerAdd(data);
		};
		ReactDOM.render(
			<MerchantBannerAddForm
				{...{
					availableBannerTypes,
					merchantId,
					onSubmit
				}}
				/>
			,
			document.getElementById('merchant-banner-add-form')
		);
	}

	handleClickBannerAdd(availableBannerTypes) {
		this.openMerchantBannerAddModal(availableBannerTypes);
	}

	handleCheckOnMain(id, isChecked) {
		this.requestBannerUpdate(id, {onMain: isChecked});
	}

	handleCheckInMailing(id, isChecked) {
		this.requestBannerUpdate(id, {inMailing: isChecked});
	}

	handleChangeUrl(id, value) {
		this.requestBannerUpdate(id, {url: value});
	}

	handleChangeCategories(id, value) {
		this.requestBannerUpdate(id, {categories: value});
	}

	handleClickDelete(id) {
		if (window.confirm('Удалить баннер?')) {
			this.requestBannerDelete(id);
		}
	}

	handleUploadImage(id, image) {
		this.requestBannerUpdate(id, {image: image.id});
	}

	getBannerById(id) {
		return _.find(this.state.banners, {id});
	}

	merchantBannerAdd(banner) {
		const {banners} = this.state;
		banners.push(banner);
		this.setState({banners}, () => {
			this.props.onChange(banners);
		});
	}

	merchantBannerUpdate(id, data) {
		const {banners} = this.state;
		const banner = this.getBannerById(id);
		_.assign(banner, data);
		this.setState({banners}, () => {
			this.props.onChange(banners);
		});
	}

	merchantBannerDelete(id) {
		const {banners} = this.state;
		_.remove(banners, banner => (banner.id === id));
		this.setState({banners}, () => {
			this.props.onChange(banners);
		});
	}

	getLimitByTypeAndName(bannerType, limitName) {
		const {limits} = this.props;
		const limitBannerName = BANNER_LIMIT_ALIAS[bannerType];
		if (Array.isArray(limitBannerName)) {
			return false;
		}
		return limits[`${limitBannerName}${limitName}`];
	}

	getLimitAvailableByTypeAndName(bannerType, limitName, propName) {
		let limit = this.getLimitByTypeAndName(bannerType, limitName);
		if (typeof limit !== 'number') {
			return null;
		}
		this.state.banners.forEach(banner => {
			if (banner.type === bannerType && banner[propName]) {
				if (Array.isArray(banner[propName])) {
					limit -= banner[propName].length;
				} else {
					limit -= 1;
				}
			}
		});
		return limit;
	}

	collectLimits(bannerType) {
		const limits = {
			length: this.getLimitByTypeAndName(bannerType, 's'),
			onMain: this.getLimitAvailableByTypeAndName(bannerType, '_on_main', 'onMain'),
			inMailing: this.getLimitAvailableByTypeAndName(bannerType, '_in_mailing', 'inMailing'),
			categories: this.getLimitAvailableByTypeAndName(bannerType, '_categories', 'categories') || this.getLimitAvailableByTypeAndName(bannerType, '_positions', 'categories') || 0
		};

		return limits;
	}

	getBannersByType(type) {
		return _.filter(this.state.banners, {type});
	}

	render() {
		const {
			categoriesAvailable
		} = this.props;

		const bannerTypes = [0, 10, 20];

		return (
			<div className="shop-edit-block">
				<h2>
					{'Загрузить баннеры'}
				</h2>

				{bannerTypes.map(bannerType => {
					const banners = this.getBannersByType(bannerType);
					const limits = this.collectLimits(bannerType);

					if (!limits.length) {
						return null;
					}

					console.log(bannerType, limits);

					return (
						<div
							key={bannerType}
							className="panel panel-default"
							>
							<div className="panel-body">
								<h3>
									{BANNER_TYPE[bannerType].name}

									<small>
										<ImageInfo
											width={BANNER_TYPE[bannerType].width}
											height={BANNER_TYPE[bannerType].height}
											/>
									</small>
								</h3>

								<div className="row">
									<div className="col-xs-12">
										<MerchantBannerAddPanel
											onClickAdd={this.handleClickBannerAdd}
											availableBannerTypes={[bannerType]}
											bannerLength={banners.length}
											bannerLimit={limits.length}
											/>

										{banners.length ? (
											<div className={className}>
												{banners.map(banner => (
													<div
														key={banner.id}
														className={b(className, 'item')}
														>
														<MerchantBanner
															onChangeCategories={this.handleChangeCategories}
															onCheckOnMain={this.handleCheckOnMain}
															onCheckInMailing={this.handleCheckInMailing}
															onChangeUrl={this.handleChangeUrl}
															onClickDelete={this.handleClickDelete}
															onUploadImage={this.handleUploadImage}
															{...{
																categoriesAvailable,
																limits
															}}
															{...banner}
															/>
													</div>
												))}
											</div>
										) : null}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}
MerchantBannerList.propTypes = {
	categoriesAvailable: React.PropTypes.array.isRequired,
	limits: React.PropTypes.object,
	merchantId: React.PropTypes.number.isRequired,
	onChange: React.PropTypes.func
};
MerchantBannerList.defaultProps = {
};

export default MerchantBannerList;

class MerchantBannerAddPanel extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickAdd = this.handleClickAdd.bind(this);
	}

	handleClickAdd() {
		this.props.onClickAdd(this.props.availableBannerTypes);
	}

	render() {
		const {bannerLength, bannerLimit} = this.props;

		return (
			<div className="merchant-banner-add-panel">
				<button
					className="btn btn-default"
					onClick={this.handleClickAdd}
					disabled={bannerLimit <= bannerLength}
					type="button"
					>
					{'Загрузить'}
				</button>

				<span className="merchant-banner-add-panel__info text-muted">
					{'Доступно '}

					<strong>
						{bannerLimit - bannerLength}
					</strong>

					{' из '}

					<strong>
						{bannerLimit}
					</strong>
				</span>
			</div>
		);
	}
}
MerchantBannerAddPanel.propTypes = {
	availableBannerTypes: React.PropTypes.array.isRequired,
	bannerLength: React.PropTypes.number,
	bannerLimit: React.PropTypes.number,
	onClickAdd: React.PropTypes.func.isRequired
};
MerchantBannerAddPanel.defaultProps = {
};

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
