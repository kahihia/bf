/* global _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import {BANNER_TYPE, REGEXP} from '../const.js';
import ImageInfo from '../common/image-info.jsx';
import ImagesUpload from '../common/images-upload.jsx';
import Select from '../components/select.jsx';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';
import UTMWarningIcon from '../common/utm-warning-icon.jsx';

const BANNER_SIDE = {
	left: 30,
	right: 40
};

class MerchantBannerBackground extends React.Component {
	constructor(props) {
		super(props);
		let category = -1;
		let url = '';
		if (props.banners.length) {
			const firstBanner = props.banners[0];
			url = firstBanner.url;

			if (props.type === 'category') {
				category = firstBanner.categories[0].id;
			}
		}
		this.state = {
			category,
			url
		};

		this.handleChangeUrl = this.handleChangeUrl.bind(this);
		this.handleImagesUploadUploadLeft = this.handleImagesUploadUploadLeft.bind(this);
		this.handleImagesUploadUploadRight = this.handleImagesUploadUploadRight.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
		this.handleClickDelete = this.handleClickDelete.bind(this);
	}

	componentWillReceiveProps(newProps) {
		const {
			banners,
			type
		} = newProps;

		if (!banners.length) {
			return;
		}

		const firstBanner = banners[0];
		const url = firstBanner.url;
		let category = -1;

		if (type === 'category') {
			category = firstBanner.categories[0].id;
		}

		this.setState({
			category,
			url
		});
	}

	handleImagesUploadUploadLeft(image) {
		this.a(BANNER_SIDE.left, image.id);
	}

	handleImagesUploadUploadRight(image) {
		this.a(BANNER_SIDE.right, image.id);
	}

	a(bannerType, imageId) {
		const banner = this.getBannerByType(bannerType);

		if (banner) {
			this.props.onChange(banner.id, {image: imageId});
			return;
		}

		this.bannerUpload(bannerType, imageId);
	}

	bannerUpload(bannerType, imageId) {
		const {
			category,
			url
		} = this.state;
		const {
			onUpload,
			type
		} = this.props;

		onUpload({
			categories: category > -1 ? [category] : [],
			image: imageId,
			inMailing: false,
			onMain: type === 'main',
			type: bannerType,
			url
		});
	}

	handleChangeCategory(category) {
		this.setState({category}, () => {
			_.forEach(this.props.banners, banner => {
				this.props.onChange(banner.id, {categories: [category]});
			});
		});
	}

	handleClickDelete(bannerId) {
		this.props.onDelete(bannerId);
	}

	handleChangeUrl(e) {
		const url = e.target.value;

		if (!REGEXP.url.test(url)) {
			return;
		}

		this.setState({url}, () => {
			_.forEach(this.props.banners, banner => {
				this.props.onChange(banner.id, {url});
			});
		});
	}

	getBannerLeft() {
		return this.getBannerByType(BANNER_SIDE.left);
	}

	getBannerRight() {
		return this.getBannerByType(BANNER_SIDE.right);
	}

	getBannerByType(type) {
		return _.find(this.props.banners, {type});
	}

	render() {
		const {
			categoriesAvailable,
			title,
			type
		} = this.props;
		const {
			category,
			url
		} = this.state;

		const bannerOptions = BANNER_TYPE[BANNER_SIDE.left];
		const {width, height} = bannerOptions;

		const left = this.getBannerLeft();
		const right = this.getBannerRight();

		const showCategorySelect = type === 'category';

		let categoriesAvailableOptions = categoriesAvailable;
		if (category === -1) {
			categoriesAvailableOptions = _.clone(categoriesAvailable);
			categoriesAvailableOptions.unshift({
				id: -1,
				name: ''
			});
		}

		return (
			<div className="panel panel-default">
				<div className="panel-body">
					<h3>
						{title}

						{showCategorySelect ? (
							<Select
								options={categoriesAvailableOptions}
								selected={category}
								onChange={this.handleChangeCategory}
								valueType="Number"
								style={{
									display: 'inline-block',
									marginLeft: 10,
									width: 'auto'
								}}
								/>
						) : null}

						<small>
							<ImageInfo
								{...{
									width,
									height
								}}
								/>
						</small>
					</h3>

					<div className="form-horizontal">
						<FormHorizontalRow
							label={(
								<span>
									<UTMWarningIcon value={url}/>
									{'URL'}
								</span>
							)}
							name="url"
							onChange={this.handleChangeUrl}
							value={url}
							type="url"
							changeOnBlur
							/>
					</div>

					{type === 'category' && (category === -1 || url === '') ? null : (
						<div className="row">
							<div className="col-xs-12">
								<table className="table">
									<thead>
										<tr>
											<th>
												{'Левая сторона'}
											</th>
											<th>
												{'Правая сторона'}
											</th>
										</tr>
									</thead>

									<tbody>
										<tr>
											<td>
												<ImagesUpload
													onUpload={this.handleImagesUploadUploadLeft}
													ext={['png', 'jpg']}
													{...{
														width,
														height
													}}
													exactSize
													/>
											</td>

											<td>
												<ImagesUpload
													onUpload={this.handleImagesUploadUploadRight}
													ext={['png', 'jpg']}
													{...{
														width,
														height
													}}
													exactSize
													/>
											</td>
										</tr>

										<tr>
											<td>
												{left ? (
													<BackgroundPreview
														onClickDelete={this.handleClickDelete}
														id={left.id}
														imageUrl={left.image.url}
														/>
												) : null}
											</td>

											<td>
												{right ? (
													<BackgroundPreview
														onClickDelete={this.handleClickDelete}
														id={right.id}
														imageUrl={right.image.url}
														/>
												) : null}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}
MerchantBannerBackground.propTypes = {
	banners: React.PropTypes.array,
	categoriesAvailable: React.PropTypes.array,
	onChange: React.PropTypes.func,
	onDelete: React.PropTypes.func,
	onUpload: React.PropTypes.func,
	title: React.PropTypes.string,
	type: React.PropTypes.string
};
MerchantBannerBackground.defaultProps = {
	banners: [],
	categoriesAvailable: []
};

export default MerchantBannerBackground;

const BackgroundImg = props => (
	<img
		className="thumbnail"
		src={props.src}
		alt=""
		style={{
			maxHeight: 400,
			width: 'auto'
		}}
		/>
);
BackgroundImg.propTypes = {
	src: React.PropTypes.string.isRequired
};

class BackgroundPreview extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickDelete = this.handleClickDelete.bind(this);
	}

	handleClickDelete() {
		this.props.onClickDelete(this.props.id);
	}

	render() {
		return (
			<div>
				<BackgroundImg src={this.props.imageUrl}/>

				<button
					className="btn btn-danger"
					onClick={this.handleClickDelete}
					type="button"
					>
					{'Удалить'}
				</button>
			</div>
		);
	}
}
BackgroundPreview.propTypes = {
	id: React.PropTypes.number.isRequired,
	imageUrl: React.PropTypes.string.isRequired,
	onClickDelete: React.PropTypes.func.isRequired
};
BackgroundPreview.defaultProps = {
};
