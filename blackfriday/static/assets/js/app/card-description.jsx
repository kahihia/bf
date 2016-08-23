/* global React */
/* eslint "react/no-danger": "off" */

import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const CardDescription = React.createClass({
	propTypes: {
		name: React.PropTypes.string,
		url: React.PropTypes.string,
		text: React.PropTypes.string,
		logo: React.PropTypes.string,
		promoCode: React.PropTypes.string,
		linkedPartners: React.PropTypes.array
	},

	getInitialState() {
		return {
			isDescCollapsed: true
		};
	},

	handleClickDesc() {
		if (!this.state.isDescCollapsed) {
			return;
		}
		this.setState({isDescCollapsed: false});
	},

	render() {
		const {name, url, text, logo, promoCode, linkedPartners} = this.props;

		return (
			<div className="card-description">
				<h1 className="card-description__title">
					<Link
						href={url}
						isExternal
						>
						{name}
					</Link>
				</h1>

				<div className="card-description__content">
					<img
						src={resolveImgPath(logo)}
						alt=""
						className="card-description__logo"
						/>

					{promoCode ? (
						<p className="card-description__promocode">
							Для предоставления скидки используйте промо-код: <code>{promoCode}</code>
						</p>
					) : null}

					<div
						className={`card-description__desc${this.state.isDescCollapsed ? ' collapsed' : ''}`}
						dangerouslySetInnerHTML={{__html: text}}
						onClick={this.handleClickDesc}
						/>

					{linkedPartners.length ? (
						<div className="paysys card-description__paysys">
							<div className="paysys__label">
								Этот магазин использует:
							</div>
							<div className="paysys__list">
								{linkedPartners.map((partner, index) => {
									return (
										<Link
											key={index}
											href={partner.url}
											isExternal
											>
											<img
												src={resolveImgPath(partner.logo)}
												alt=""
												/>
										</Link>
									);
								})}
							</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
});

export default CardDescription;
