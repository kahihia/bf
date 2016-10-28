/* global window */

import React from 'react';
import formatThousands from 'format-thousands';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

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

		let priceOld = data.oldPrice;
		let priceOldCur = false;
		if (
			priceOld &&
			!/[A-Za-zА-Яа-я]/gi.test(priceOld)
		) {
			priceOld = String(priceOld).replace(/\d+/gi, match => {
				return formatThousands(match);
			});
			priceOldCur = true;
		}

		let priceNew = data.price;
		let priceNewCur = false;
		if (
			priceNew &&
			!/[A-Za-zА-Яа-я]/gi.test(priceNew)
		) {
			priceNew = String(priceNew).replace(/\d+/gi, match => {
				return formatThousands(match);
			});
			priceNewCur = true;
		}

		return (
			<div className="short-product">
				<Link
					className="short-product__link"
					href={data.url}
					onClick={this.handleClick}
					isExternal
					>
					<div className="short-product__preview">
						<img
							src={data.image}
							alt=""
							className="img-responsive"
							/>
					</div>

					<div className="short-product__name">
						{data.name}
					</div>

					{data.category ? (
						<div className="short-product__cat">
							{data.category.name}
						</div>
					) : null}

					<div className="short-product__price">
						<del className="price price_old">
							{data.startPrice ? (
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

						{data.discount ? (
							<div className="price price_theme_normal">
								<span className="price__prefix">
									{'скидка '}
								</span>

								<span className="price__cost">
									{data.discount}
								</span>

								<span className="price__currency">
									{'%'}
								</span>
							</div>
						) : (
							<div className="price price_theme_normal">
								{data.startPrice ? (
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

				{data.merchant_url ? (
					<a
						className="short-product__shop"
						href={data.merchant_url}
						>
						<img
							src={resolveImgPath(data.logo)}
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
