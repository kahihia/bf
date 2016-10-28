/* eslint react/no-danger: 0 */

import React from 'react';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const CardDescription = React.createClass({
	propTypes: {
		description: React.PropTypes.string,
		linkedPartners: React.PropTypes.array,
		image: React.PropTypes.string,
		name: React.PropTypes.string,
		promocode: React.PropTypes.string,
		url: React.PropTypes.string
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
		const {
			description,
			linkedPartners,
			image,
			name,
			promocode,
			url
		} = this.props;

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
						src={resolveImgPath(image)}
						alt=""
						className="card-description__logo"
						/>

					{promocode ? (
						<p className="card-description__promocode">
							{'Для предоставления скидки используйте промо-код: '}

							<code>
								{promocode}
							</code>
						</p>
					) : null}

					<div
						className={`card-description__desc${this.state.isDescCollapsed ? ' collapsed' : ''}`}
						dangerouslySetInnerHTML={{__html: description}}
						onClick={this.handleClickDesc}
						/>

					{linkedPartners.length ? (
						<div className="paysys card-description__paysys">
							<div className="paysys__label">
								{'Этот магазин использует:'}
							</div>

							<div className="paysys__list">
								{linkedPartners.map((partner, index) => (
									<Link
										key={index}
										href={partner.url}
										isExternal
										>
										<img
											src={resolveImgPath(partner.image)}
											alt=""
											/>
									</Link>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
});

export default CardDescription;
