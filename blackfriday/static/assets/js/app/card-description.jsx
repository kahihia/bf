/* eslint react/no-danger: 0 */

import React from 'react';
import b from 'b_';
import Link from './link.jsx';
import trackers from './trackers.js';

const className = 'card-description';

const CardDescription = React.createClass({
	propTypes: {
		data: React.PropTypes.object,
		linkedPartners: React.PropTypes.array
	},

	getInitialState() {
		return {
			isDescCollapsed: false
		};
	},

	componentDidMount() {
		if (this.description.offsetHeight > 100) {
			this.setState({isDescCollapsed: true});
		}

		const {
			data
		} = this.props;

		if (data.merchant) {
			trackers.merchant.shown(data.merchant.id);
		}
	},

	handleClickDesc() {
		if (!this.state.isDescCollapsed) {
			return;
		}
		this.setState({isDescCollapsed: false});
	},

	handleClickMerchantUrl() {
		const {
			data
		} = this.props;

		if (data.merchant) {
			trackers.merchant.clicked(data.merchant.id);
		}
	},

	render() {
		const {
			data,
			linkedPartners
		} = this.props;
		const {
			description,
			image,
			name,
			promocode,
			url
		} = data;

		const descriptionRef = node => {
			this.description = node;
		};

		return (
			<div className={className}>
				<h1 className={b(className, 'title')}>
					<Link
						href={url}
						onClick={this.handleClickMerchantUrl}
						isExternal
						>
						{name}
					</Link>
				</h1>

				<div className={b(className, 'content')}>
					<img
						src={image}
						alt=""
						className={b(className, 'logo')}
						/>

					{promocode ? (
						<p className={b(className, 'promocode')}>
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
						ref={descriptionRef}
						/>

					{linkedPartners.length ? (
						<div className={'paysys ' + b(className, 'paysys')}>
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
											src={partner.image}
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
