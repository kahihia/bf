import React from 'react';
import b from 'b_';
import MultiselectTwoSides from 'react-multiselect-two-sides';
import {BANNER_TYPE} from '../const.js';
import ControlLabel from '../components/control-label.jsx';
import Checkbox from '../components/checkbox.jsx';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';
import ImagesUpload from '../common/images-upload.jsx';
import UTMWarningIcon from '../common/utm-warning-icon.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const className = 'merchant-banner';

class MerchantBanner extends React.Component {
	constructor(props) {
		super(props);

		this.handleCheckOnMain = this.handleCheckOnMain.bind(this);
		this.handleCheckInMailing = this.handleCheckInMailing.bind(this);
		this.handleChangeUrl = this.handleChangeUrl.bind(this);
		this.handleChangeCategories = this.handleChangeCategories.bind(this);
		this.handleUploadImage = this.handleUploadImage.bind(this);
		this.handleClickDelete = this.handleClickDelete.bind(this);
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

	handleUploadImage(image) {
		this.props.onUploadImage(this.props.id, image);
	}

	handleClickDelete() {
		this.props.onClickDelete(this.props.id);
	}

	render() {
		const {
			categories,
			categoriesAvailable,
			categoriesHighlighted,
			image,
			inMailing,
			limits,
			onMain,
			type,
			url,
			wasMailed
		} = this.props;
		const banner = BANNER_TYPE[type];
		const categoriesSelected = categories.map(item => item.id);

		const readonly = type === 0 && Boolean(wasMailed);

		let showOnMain = limits.onMain || limits.onMain === 0;
		let disabledOnMain = limits.onMain === 0 && !onMain;

		let showInMailing = limits.inMailing || limits.inMailing === 0;
		let disabledInMailing = limits.inMailing === 0 && !inMailing;

		let showCategories = limits.categories || limits.categoriesSelected.length;
		let disabledCategories = false;

		let categoriesLimit = limits.categories;
		if (limits.categoriesPositions <= limits.categories) {
			categoriesLimit = limits.categoriesPositions + categoriesSelected.length;
		}

		if (categoriesSelected.length >= categoriesLimit) {
			categoriesLimit = categoriesSelected.length;
		}

		// superbanner
		if (type === 0) {
			const isCategoriesSelected = Boolean(categoriesSelected.length);
			const isLimitCategoriesSelected = Boolean(limits.categoriesSelected.length);

			if (showOnMain) {
				if (onMain) {
					disabledOnMain = false;
				} else if (!disabledOnMain) {
					if (
						inMailing ||
						(!isCategoriesSelected && isLimitCategoriesSelected)
					) {
						disabledOnMain = true;
					}
				}
			}

			if (showInMailing) {
				if (inMailing) {
					disabledInMailing = false;
				} else if (!disabledInMailing) {
					if (
						onMain ||
						isCategoriesSelected
					) {
						disabledInMailing = true;
					}
				}
			}

			if (showCategories) {
				if (isCategoriesSelected) {
					disabledCategories = false;

					if (categoriesSelected.length !== limits.categoriesSelected.length) {
						categoriesLimit = categoriesSelected.length;
					}
				} else if (!disabledCategories) {
					if (
						inMailing ||
						(!isCategoriesSelected && isLimitCategoriesSelected) ||
						disabledOnMain
					) {
						disabledCategories = true;
					}
				}
			}
		// verticalbanner
		} else if (type === 20) {
			showOnMain = false;
		}

		return (
			<div className={className}>
				<div className={b(className, 'content')}>
					<div className="row">
						<div className="col-xs-4">
							<div className={b(className, 'preview')}>
								<img
									className="img-responsive"
									src={image.url}
									alt=""
									/>

								{readonly ? (
									<span className="text-muted">
										{'Баннер участвовал в рассылке.'}
									</span>
								) : (
									<ImagesUpload
										onUpload={this.handleUploadImage}
										ext={['png', 'jpg']}
										size="sm"
										width={banner.width}
										height={banner.height}
										exactSize
										/>
								)}

								{readonly ? null : (
									<span
										className={b(className, 'remove')}
										onClick={this.handleClickDelete}
										title="Удалить баннер"
										>
										<Glyphicon name="remove"/>
									</span>
								)}
							</div>
						</div>

						{showOnMain || showInMailing || showCategories ? (
							<div className="col-xs-2">
								<ControlLabel name="Показывать"/>

								{showOnMain ? (
									<Checkbox
										name="onMain"
										text="На главной"
										isChecked={onMain}
										onChange={this.handleCheckOnMain}
										disabled={disabledOnMain || readonly}
										/>
								) : null}

								{showInMailing ? (
									<Checkbox
										name="inMailing"
										text="В рассылке"
										isChecked={inMailing}
										onChange={this.handleCheckInMailing}
										disabled={disabledInMailing || readonly}
										/>
								) : null}
							</div>
						) : null}

						{showCategories ? (
							<div className="col-xs-6">
								<MultiselectTwoSides
									onChange={this.handleChangeCategories}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									disabled={disabledCategories || readonly}
									options={categoriesAvailable}
									value={categoriesSelected}
									highlight={categoriesHighlighted}
									limit={categoriesLimit}
									labelKey="name"
									valueKey="id"
									showControls
									searchable
									/>
							</div>
						) : null}
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
							disabled={readonly}
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
	categories: React.PropTypes.array,
	categoriesAvailable: React.PropTypes.array,
	categoriesHighlighted: React.PropTypes.array,
	id: React.PropTypes.number,
	image: React.PropTypes.object,
	inMailing: React.PropTypes.bool,
	limits: React.PropTypes.object,
	onChangeCategories: React.PropTypes.func,
	onChangeUrl: React.PropTypes.func,
	onCheckInMailing: React.PropTypes.func,
	onCheckOnMain: React.PropTypes.func,
	onClickDelete: React.PropTypes.func,
	onMain: React.PropTypes.bool,
	onUploadImage: React.PropTypes.func,
	type: React.PropTypes.number,
	url: React.PropTypes.string,
	wasMailed: React.PropTypes.bool
};
MerchantBanner.defaultProps = {
};

export default MerchantBanner;
