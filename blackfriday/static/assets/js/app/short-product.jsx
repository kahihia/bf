/* global window */

import React from 'react';
import formatThousands from 'format-thousands';
import b from 'b_';
import Price from 'react-price';
import Link from './link.jsx';

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
		this.state = {};

		this.handleClick = this.handleClick.bind(this);
	}

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
	}

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

				{data.merchant && data.merchant.url ? (
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
	data: React.PropTypes.object.isRequired
};
ShortProduct.defaultProps = {
};

export default ShortProduct;
