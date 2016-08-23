/* global React, window */

import formatThousands from 'format-thousands';

import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const ShortProduct = React.createClass({
	propTypes: {
		data: React.PropTypes.object
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
		const item = this.props.data;

		let priceOld = item.price_old;
		let priceOldCur = false;
		if (
			priceOld &&
			!/[A-Za-zА-Яа-я]/gi.test(priceOld)
		) {
			priceOld = priceOld.replace(/\d+/gi, match => {
				return formatThousands(match);
			});
			priceOldCur = true;
		}

		let priceNew = item.price;
		let priceNewCur = false;
		if (
			priceNew &&
			!/[A-Za-zА-Яа-я]/gi.test(priceNew)
		) {
			priceNew = priceNew.replace(/\d+/gi, match => {
				return formatThousands(match);
			});
			priceNewCur = true;
		}

		return (
			<div className="short-product">
				<Link
					className="short-product__link"
					href={item.url}
					onClick={this.handleClick}
					isExternal
					>
					<div className="short-product__preview">
						<img src={item.image_url} alt="" className="img-responsive"/>
					</div>
					<div className="short-product__name">
						{item.name}
					</div>
					{item.cat_name ? (
						<div className="short-product__cat">
							{item.cat_name}
						</div>
					) : null}
					<div className="short-product__price">
						<del className="price price_old">
							{item.start_price ? (
								<span className="price__prefix">
									{'от '}
								</span>
							) : null}
							<span className="price__cost">
								{priceOld}
							</span>
							{priceOldCur ? (
								<span className="price__currency">
									{priceOld ? 'руб.' : ''}
								</span>
							) : null}
						</del>

						{item.discount ? (
							<div className="price price_theme_normal">
								<span className="price__prefix">
									{'скидка '}
								</span>
								<span className="price__cost">
									{item.discount}
								</span>
								<span className="price__currency">
									{'%'}
								</span>
							</div>
						) : (
							<div className="price price_theme_normal">
								{item.start_price ? (
									<span className="price__prefix">
										{'от '}
									</span>
								) : null}
								<span className="price__cost">
									{priceNew}
								</span>
								{priceNewCur ? (
									<span className="price__currency">
										{priceNew ? 'руб.' : ''}
									</span>
								) : null}
							</div>
						)}
					</div>
				</Link>
				{item.merchant_url ? (
					<a
						className="short-product__shop"
						href={item.merchant_url}
						>
						<img
							src={resolveImgPath(item.logo)}
							alt=""
							className="short-product__logo"
							/>
					</a>
				) : null}
			</div>
		);
	}
});

export default ShortProduct;
