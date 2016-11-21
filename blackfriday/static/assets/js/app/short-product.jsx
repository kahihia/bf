import React from 'react';
import formatThousands from 'format-thousands';
import b from 'b_';
import Price from 'react-price';
import Link from './link.jsx';
import {action2, action5} from './retailrocket.js';
import trackers from './trackers.js';

const CURRENCY = 'руб.';

const className = 'short-product';

const ShortProductPrice = props => (
	<div className={b(className, 'price')}>
		{props.oldPrice ? (
			<Price
				cost={formatThousands(props.oldPrice)}
				currency={CURRENCY}
				type="old"
				/>
		) : (
			<del className="price price_old"/>
		)}

		{props.price ? (
			<Price
				cost={formatThousands(props.price)}
				currency={CURRENCY}
				className="price_theme_normal"
				/>
		) : null}

		{props.discount ? (
			<Price
				cost={props.discount}
				currency="%"
				className="price_theme_normal"
				prefix="скидка "
				/>
		) : null}

		{props.startPrice ? (
			<Price
				cost={formatThousands(props.startPrice)}
				currency={CURRENCY}
				className="price_theme_normal"
				prefix="от "
				/>
		) : null}

		{props.price || props.discount || props.startPrice ? null : (
			<span className="price price_theme_normal"/>
		)}
	</div>
);
ShortProductPrice.propTypes = {
	discount: React.PropTypes.number,
	oldPrice: React.PropTypes.number,
	price: React.PropTypes.number,
	startPrice: React.PropTypes.number
};
ShortProductPrice.defaultProps = {
};

class ShortProduct extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		const {
			data,
			isTeaser
		} = this.props;

		if (isTeaser) {
			trackers.teaser.shown(data.id);
		}
	}

	handleClick() {
		const {
			data,
			isTeaser
		} = this.props;
		const {
			id,
			name,
			price,
			oldPrice,
			image,
			url,
			category,
			merchant,
			brand
		} = data;

		const categoryPaths = [category];
		if (merchant && merchant.name) {
			categoryPaths.unshift(merchant.name);
		}

		action2({
			id,
			name,
			price,
			oldPrice,
			imageUrl: image,
			url,
			categoryPaths,
			brand
		});

		action5({
			id,
			price
		});

		if (isTeaser) {
			trackers.teaser.clicked(id);
		}

		if (merchant) {
			trackers.merchant.clicked(merchant.id);
		}
	}

	render() {
		const {
			data,
			showCategory,
			showMerchant
		} = this.props;
		const {
			discount,
			oldPrice,
			price,
			startPrice
		} = data;

		return (
			<div className={className}>
				<Link
					className={b(className, 'link')}
					href={data.url}
					onClick={this.handleClick}
					isExternal
					>
					<div className={b(className, 'preview')}>
						<img
							src={data.image}
							alt=""
							className="img-responsive"
							/>
					</div>

					<div className={b(className, 'name')}>
						{data.name}
					</div>

					{showCategory && data.category ? (
						<div className={b(className, 'cat')}>
							{data.category}
						</div>
					) : null}

					<ShortProductPrice
						{...{
							discount,
							oldPrice,
							price,
							startPrice
						}}
						/>
				</Link>

				{showMerchant && data.merchant && data.merchant.url ? (
					<a
						className={b(className, 'shop')}
						href={data.merchant.url}
						>
						<img
							src={data.merchant.image}
							alt=""
							className={b(className, 'logo')}
							/>
					</a>
				) : null}
			</div>
		);
	}
}
ShortProduct.propTypes = {
	data: React.PropTypes.object.isRequired,
	isTeaser: React.PropTypes.bool,
	showCategory: React.PropTypes.bool,
	showMerchant: React.PropTypes.bool
};
ShortProduct.defaultProps = {
	showCategory: true,
	showMerchant: true
};

export default ShortProduct;
