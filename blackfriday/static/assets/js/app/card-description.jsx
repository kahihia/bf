/* eslint react/no-danger: 0 */

import React from 'react';
import b from 'b_';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const className = 'card-description';

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
			isDescCollapsed: false
		};
	},

	componentDidMount() {
		if (this.description.offsetHeight > 100) {
			this.setState({isDescCollapsed: true});
		}
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

		const descriptionRef = node => {
			this.description = node;
		};

		return (
			<div className={className}>
				<h1 className={b(className, 'title')}>
					<Link
						href={url}
						isExternal
						>
						{name}
					</Link>
				</h1>

				<div className={b(className, 'content')}>
					<img
						src={resolveImgPath(image)}
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
