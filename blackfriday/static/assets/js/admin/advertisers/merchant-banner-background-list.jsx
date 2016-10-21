/* global _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import MerchantBannerBackground from './merchant-banner-background.jsx';

class MerchantBannerBackgroundList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleUploadBannerBackground = this.handleUploadBannerBackground.bind(this);
		this.handleDeleteBannerBackground = this.handleDeleteBannerBackground.bind(this);
		this.handleChangeBannerBackground = this.handleChangeBannerBackground.bind(this);
	}

	handleUploadBannerBackground(banner) {
		this.props.onUpload(banner);
	}

	handleDeleteBannerBackground(bannerId) {
		this.props.onDelete(bannerId);
	}

	handleChangeBannerBackground(id, props) {
		this.props.onChange(id, props);
	}

	render() {
		const {
			banners,
			categoriesAvailable,
			title,
			limit,
			type
		} = this.props;

		const categoriesAvailableOptions = _.cloneDeep(categoriesAvailable);

		let bannerGroups = [banners];
		if (type === 'category') {
			bannerGroups = _.groupBy(banners, banner => banner.categories[0].id);
			bannerGroups = _.map(bannerGroups);
			_.forEach(bannerGroups, bannerGroup => {
				const firstBanner = bannerGroup[0];
				const categoryId = firstBanner.categories[0].id;
				_.find(categoriesAvailableOptions, {id: categoryId}).disabled = true;
			});
		}

		return (
			<div>
				{bannerGroups.map((banners, index) => (
					<MerchantBannerBackground
						key={index}
						categoriesAvailable={categoriesAvailableOptions}
						onUpload={this.handleUploadBannerBackground}
						onDelete={this.handleDeleteBannerBackground}
						onChange={this.handleChangeBannerBackground}
						{...{
							banners,
							title,
							type
						}}
						/>
				))}

				{limit - bannerGroups.length > 0 ? (
					<MerchantBannerBackground
						categoriesAvailable={categoriesAvailableOptions}
						onUpload={this.handleUploadBannerBackground}
						{...{
							title,
							type
						}}
						/>
				) : null}
			</div>
		);
	}
}
MerchantBannerBackgroundList.propTypes = {
	banners: React.PropTypes.array,
	categoriesAvailable: React.PropTypes.array,
	limit: React.PropTypes.number,
	onChange: React.PropTypes.func,
	onDelete: React.PropTypes.func,
	onUpload: React.PropTypes.func,
	title: React.PropTypes.string,
	type: React.PropTypes.string
};
MerchantBannerBackgroundList.defaultProps = {
};

export default MerchantBannerBackgroundList;
