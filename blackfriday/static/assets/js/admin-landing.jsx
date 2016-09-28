/* global document toastr _ jQuery */
/* eslint react/require-optimization: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import Glyphicon from './admin/components/glyphicon.jsx';
import {TOKEN} from './admin/const.js';
import AddLandingLogoForm from './admin/landing/add-landing-logo-form.jsx';
import EditLandingLogoForm from './admin/landing/edit-landing-logo-form.jsx';
import SortableLandingLogoListItem from './admin/landing/sortable-landing-logo-list-item.jsx';

(function () {
	'use strict';

	const AdminLanding = React.createClass({
		getInitialState() {
			return {
				draggingIndex: null,
				fromPosition: null,
				toPosition: null,
				logos: [],
				isLoading: false
			};
		},

		componentWillMount() {
			this.requestLandingLogos();
		},

		requestLandingLogos() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/landing-logos/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 200) {
					if (data) {
						const logos = _.sortBy(data, 'position');
						this.setState({logos});
					}
				} else {
					toastr.error('Не удалось получить список логотипов');
				}
			});
		},

		requestReorderLandingLogos() {
			this.setState({isLoading: true});

			const json = _.sortBy(this.state.logos, 'position').map(item => {
				return item.id;
			});

			xhr({
				url: '/api/landing-logos/reorder/',
				method: 'POST',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState(previousState => {
							previousState.logos = _.sortBy(data, 'position');
							return previousState;
						});
					}
				} else {
					toastr.error('Не удалось изменить порядок логотипов');
				}
			});
		},

		requestStaticGeneratorLanding() {
			this.setState({isLoading: true});

			xhr({
				url: '/api/static-generator/landing/',
				method: 'POST',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp) => {
				this.setState({isLoading: false});

				if (!err && resp.statusCode === 201) {
					toastr.success('Лэндинг успешно сгенерирован');
				} else {
					toastr.error('Не удалось сгенерировать лэндинг');
				}
			});
		},

		updateState(data) {
			let {fromPosition, toPosition} = this.state;
			if (typeof data.draggingIndex === 'string') {
				fromPosition = parseInt(data.draggingIndex, 10) + 1;
				this.setState({fromPosition});
				return;
			}

			if (data.draggingIndex !== null) {
				toPosition = data.draggingIndex + 1;
				this.setState({toPosition});
				return;
			}

			if (fromPosition === null || toPosition === null) {
				return;
			}

			const fromLogo = this.getLogoByPosition(fromPosition);
			const toLogo = this.getLogoByPosition(toPosition);

			if (!fromLogo || !toLogo) {
				return;
			}
			fromLogo.position = toPosition;
			toLogo.position = fromPosition;

			this.setState({
				fromPosition: null,
				toPosition: null,
				logos: _.sortBy(this.state.logos, 'position')
			}, () => {
				this.requestReorderLandingLogos();
			});
		},

		handleClickLandingLogoAdd() {
			const $modal = jQuery('#add-landing-logo-modal');
			$modal.modal('show');
			const onSubmit = data => {
				this.addLandingLogo(data);

				$modal.modal('hide');
			};
			ReactDOM.render(
				<AddLandingLogoForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-landing-logo-form')
			);
		},

		handleClickLandingLogoEdit(id) {
			const $modal = jQuery('#edit-landing-logo-modal');
			$modal.modal('show');
			const onSubmit = data => {
				this.editLandingLogo(data);

				$modal.modal('hide');
			};
			ReactDOM.render(
				<EditLandingLogoForm
					id={id}
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('edit-landing-logo-form')
			);
		},

		handleClickStaticGeneratorLanding() {
			this.requestStaticGeneratorLanding();
		},

		addLandingLogo(data) {
			if (data) {
				this.setState(previousState => {
					previousState.logos.push(data);
					return previousState;
				});
			}
		},

		editLandingLogo(data) {
			if (data) {
				const logo = this.getLogoById(data.id);
				_.merge(logo, data);
				this.forceUpdate();
			}
		},

		getLogoById(id) {
			return _.find(this.state.logos, {id});
		},

		getLogoByPosition(position) {
			return _.find(this.state.logos, {position});
		},

		render() {
			const {draggingIndex, logos} = this.state;

			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickLandingLogoAdd}
						type="button"
						>
						{'Добавить'}
					</button>

					{' '}

					<button
						className="btn btn-warning"
						onClick={this.handleClickStaticGeneratorLanding}
						type="button"
						>
						<Glyphicon name="refresh"/>
						{' Сгенерировать'}
					</button>

					<hr/>

					<div className="landing-logo-list">
						{logos.map((item, index) => {
							return (
								<SortableLandingLogoListItem
									key={item.id}
									updateState={this.updateState}
									items={_.clone(logos)}
									draggingIndex={draggingIndex}
									sortId={index}
									outline="column"
									childProps={{data: item}}
									>
									<LandingLogoListItem
										onClick={this.handleClickLandingLogoEdit}
										{...item}
										/>
								</SortableLandingLogoListItem>
							);
						})}
					</div>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-landing');
	ReactDOM.render(<AdminLanding/>, block);
})();

class LandingLogoListItem extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickLandingLogoEdit = this.handleClickLandingLogoEdit.bind(this);
	}

	handleClickLandingLogoEdit(e) {
		e.preventDefault();
		this.props.onClick(this.props.id);
	}

	render() {
		const {image, url} = this.props;

		return (
			<div className="">
				<a
					className="landing-logo-list__link"
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					>
					<img
						className="landing-logo-list__logo"
						src={image}
						alt=""
						/>
				</a>

				<span
					className="landing-logo-list__edit"
					title="Отредактировать"
					onClick={this.handleClickLandingLogoEdit}
					>
					<Glyphicon name="pencil"/>
				</span>
			</div>
		);
	}
}
LandingLogoListItem.propTypes = {
	id: React.PropTypes.number,
	image: React.PropTypes.string,
	onClick: React.PropTypes.func,
	url: React.PropTypes.string
};
LandingLogoListItem.defaultProps = {
};
