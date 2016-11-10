/* global window */

import React from 'react';
import formatThousands from 'format-thousands';
import b from 'b_';
import Price from 'react-price';
import Link from './link.jsx';

const CURRENCY = 'руб.';

const className = 'short-product';

const ShortProduct = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired
	},

	handleClick() {
		if (!window.rrApiOnReady) {
			return;
		}

		const id = this.props.data.id;
		window.rrApiOnReady.push(function () {
			try {
				window.rrApi.view(id);
			} catch (e) {}
		});
	},

	render() {
		const {data} = this.props;
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

					{data.category ? (
						<div className={b(className, 'cat')}>
							{data.category.name}
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

				{data.merchant_url ? (
					<a
						className={b(className, 'shop')}
						href={data.merchant_url}
						>
						<img
							src={data.logo}
							alt=""
							className={b(className, 'logo')}
							/>
					</a>
				) : null}
			</div>
		);
	}
});

export default ShortProduct;

class ShortProductPrice extends React.Component {
	render() {
		const {
			discount,
			oldPrice,
			price,
			startPrice
		} = this.props;

		return (
			<div className={b(className, 'price')}>
				{oldPrice ? (
					<Price
						cost={formatThousands(oldPrice)}
						currency={CURRENCY}
						type="old"
						/>
				) : (
					<del className="price price_old"/>
				)}

				{price ? (
					<Price
						cost={formatThousands(price)}
						currency={CURRENCY}
						className="price_theme_normal"
						/>
				) : null}

				{discount ? (
					<Price
						cost={discount}
						currency="%"
						className="price_theme_normal"
						prefix="скидка "
						/>
				) : null}

				{startPrice ? (
					<Price
						cost={formatThousands(startPrice)}
						currency={CURRENCY}
						className="price_theme_normal"
						prefix="от "
						/>
				) : null}
			</div>
		);
	}
}
ShortProductPrice.propTypes = {
	discount: React.PropTypes.number,
	oldPrice: React.PropTypes.number,
	price: React.PropTypes.number,
	startPrice: React.PropTypes.number
};
ShortProductPrice.defaultProps = {
};
