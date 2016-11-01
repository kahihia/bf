/* global document _ jQuery */
/* eslint camelcase: 0 */
/* eslint react/require-optimization: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';

const LIMIT_NAME = {
	data: 'Информация',
	logo_categories: 'Категории размещения логотипа',
	banners: 'Баннеры',
	products: 'Товары'
};

const LIMIT_DATA_NAME = {
	name: 'Название',
	url: 'URL',
	description: 'Описание',
	image: 'Логотип',
	logo_categories: 'Категории',
	banners: 'Баннеры',
	products: 'Товары'
};

const className = 'merchant-fake-save';

class MerchantFakeSave extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleClickSave = this.handleClickSave.bind(this);
	}

	handleClickSave() {
		this.props.onClickSave(result => {
			this.openMerchantFakeSaveModal(result);
		});
	}

	renderList(result) {
		let isEmpty = true;
		_.forEach(result, limit => {
			if (limit.data.length) {
				isEmpty = false;
				return false;
			}
		});

		if (isEmpty) {
			return null;
		}

		return (
			<div>
				<p>
					{'Осталось предоставить:'}
				</p>

				<ul className="list-unstyled">
					{result.map(limit => {
						if (!limit.data.length) {
							return null;
						}

						return (
							<li key={limit.name}>
								<strong>
									{LIMIT_NAME[limit.name]}
								</strong>

								<ul>
									{limit.data.map(data => (
										<li key={data}>
											{typeof data === 'string' ? LIMIT_DATA_NAME[data] : `${LIMIT_DATA_NAME[data.name]}: ${data.value} шт.`}
										</li>
									))}
								</ul>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	openMerchantFakeSaveModal(result) {
		jQuery('#merchant-fake-save-modal').modal('show');
		ReactDOM.render(
			this.renderList(result),
			document.getElementById('merchant-fake-save-form')
		);
	}

	render() {
		return (
			<div className={className}>
				<div className={b(className, 'data')}/>

				<div className={b(className, 'action')}>
					<button
						className="btn btn-primary"
						onClick={this.handleClickSave}
						type="button"
						>
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
}
MerchantFakeSave.propTypes = {
	onClickSave: React.PropTypes.func.isRequired
};
MerchantFakeSave.defaultProps = {
};

export default MerchantFakeSave;
