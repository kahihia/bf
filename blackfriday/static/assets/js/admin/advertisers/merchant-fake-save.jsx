/* global document _ jQuery */
/* eslint camelcase: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';

const LIMIT_NAME = {
	banners: 'Баннеры',
	data: 'Информация',
	logo_categories: 'Категории размещения логотипа',
	products: 'Товары'
};

const LIMIT_DATA_NAME = {
	backgrounds: 'Фоны',
	backgrounds_left: 'Левые',
	backgrounds_right: 'Правые',
	banner_count: 'Баннеры',
	banners: 'Акционные баннеры',
	categories: 'Уникальные категории',
	category_backgrounds: 'В категории',
	description: 'Описание',
	image: 'Изображение',
	in_mailing: 'В рассылке',
	logo: 'Логотип',
	logo_categories: 'Категории размещения',
	main_backgrounds: 'На главной',
	name: 'Название',
	on_main: 'На главной',
	positions: 'Позиции',
	superbanners: 'Супербаннеры',
	teasers: 'Тизеры сквозные',
	teasers_on_main: 'Тизеры на главной',
	url: 'URL',
	utm: 'UTM метки в ссылках',
	vertical_banners: 'Вертикальные баннеры'
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
				<p className="lead">
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
									{limit.data.map((data, index) => (
										<Item
											key={index}
											data={data}
											/>
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

const ItemString = props => (
	<li>
		{LIMIT_DATA_NAME[props.data]}
	</li>
);
ItemString.propTypes = {
	data: React.PropTypes.string.isRequired
};
// ItemString.defaultProps = {};

const ItemArray = props => (
	<li>
		<ul className="list-unstyled">
			<strong>
				{LIMIT_DATA_NAME[props.data.name]}
			</strong>

			{props.data.data.map((item, index) => (
				<Item
					key={index}
					data={item}
					/>
			))}
		</ul>
	</li>
);
ItemArray.propTypes = {
	data: React.PropTypes.object.isRequired
};
// ItemArray.defaultProps = {};

const ItemObject = props => (
	<li>
		{`${LIMIT_DATA_NAME[props.data.name]}: ${props.data.value} шт.`}
	</li>
);
ItemObject.propTypes = {
	data: React.PropTypes.object.isRequired
};
// ItemObject.defaultProps = {};

const Item = props => {
	const {data} = props;
	if (typeof data === 'string') {
		return <ItemString data={data}/>;
	} else if (data.data && Array.isArray(data.data)) {
		return <ItemArray data={data}/>;
	}
	return <ItemObject data={data}/>;
};
Item.propTypes = {
	data: React.PropTypes.oneOfType([
		React.PropTypes.array,
		React.PropTypes.object,
		React.PropTypes.string
	]).isRequired
};
// Item.defaultProps = {};
