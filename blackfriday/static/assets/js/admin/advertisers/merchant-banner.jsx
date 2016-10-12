/* eslint react/require-optimization: 0 */

import React from 'react';
import b from 'b_';
import {BANNER_TYPE} from '../const.js';
import ImageInfo from '../common/image-info.jsx';
import ControlLabel from '../components/control-label.jsx';
import Checkbox from '../components/checkbox.jsx';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';
import UTMWarningIcon from '../common/utm-warning-icon.jsx';
import MultiselectTwoSides from 'react-multiselect-two-sides';

const className = 'merchant-banner';

class MerchantBanner extends React.Component {
	constructor(props) {
		super(props);

		this.handleCheckOnMain = this.handleCheckOnMain.bind(this);
		this.handleCheckInMailing = this.handleCheckInMailing.bind(this);
		this.handleChangeUrl = this.handleChangeUrl.bind(this);
		this.handleChangeCategories = this.handleChangeCategories.bind(this);
	}

	handleCheckOnMain(isChecked) {
		this.props.onCheckOnMain(this.props.id, isChecked);
	}

	handleCheckInMailing(isChecked) {
		this.props.onCheckInMailing(this.props.id, isChecked);
	}

	handleChangeUrl(e) {
		this.props.onChangeUrl(this.props.id, e.target.value);
	}

	handleChangeCategories(value) {
		this.props.onChangeCategories(this.props.id, value);
	}

	render() {
		const {
			availableCategories,
			categories,
			image,
			inMailing,
			onMain,
			type,
			url
		} = this.props;
		const banner = BANNER_TYPE[type];

		return (
			<div className={className}>
				<div className={b(className, 'heading')}>
					<ImageInfo
						label={banner.name}
						width={banner.width}
						height={banner.height}
						/>
				</div>

				<div className={b(className, 'content')}>
					<div className="row">
						<div className="col-xs-4">
							<img
								className="thumbnail img-responsive"
								src={image.url}
								alt=""
								/>
						</div>

						<div className="col-xs-2">
							<ControlLabel
								name="Показывать"
								/>

							<Checkbox
								name="onMain"
								text="На главной"
								isChecked={onMain}
								onChange={this.handleCheckOnMain}
								/>

							<Checkbox
								name="inMailing"
								text="В рассылке"
								isChecked={inMailing}
								onChange={this.handleCheckInMailing}
								/>
						</div>

						<div className="col-xs-6">
							<MultiselectTwoSides
								onChange={this.handleChangeCategories}
								clearFilterText="Очистить"
								availableHeader="Доступные"
								selectedHeader="Выбранные"
								selectAllText="Выбрать все"
								deselectAllText="Очистить"
								options={availableCategories}
								value={categories}
								labelKey="name"
								valueKey="id"
								showControls
								searchable
								/>
						</div>
					</div>
				</div>

				<div className={b(className, 'footer')}>
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
				</div>
			</div>
		);
	}
}
MerchantBanner.propTypes = {
	availableCategories: React.PropTypes.array,
	categories: React.PropTypes.array,
	id: React.PropTypes.number,
	image: React.PropTypes.object,
	inMailing: React.PropTypes.bool,
	onChangeCategories: React.PropTypes.func,
	onChangeUrl: React.PropTypes.func,
	onCheckInMailing: React.PropTypes.func,
	onCheckOnMain: React.PropTypes.func,
	onMain: React.PropTypes.bool,
	type: React.PropTypes.number,
	url: React.PropTypes.string
};
MerchantBanner.defaultProps = {
};

export default MerchantBanner;
