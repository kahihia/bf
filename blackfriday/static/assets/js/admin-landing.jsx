/* global window document toastr _ jQuery */
/* eslint-disable no-alert */
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

				if (!err && resp.statusCode === 200) {
					toastr.success('Лэндинг успешно сгенерирован');
				} else {
					toastr.error('Не удалось сгенерировать лэндинг');
				}
			});
		},

		requestLandingLogoDelete(id) {
			this.setState({isLoading: true});

			xhr({
				url: `/api/landing-logos/${id}/`,
				method: 'DELETE',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				switch (resp.statusCode) {
					case 204: {
						this.deleteLandingLogo(id);
						break;
					}
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось удалить логотип');
						break;
					}
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

		handleClickLandingLogoDelete(id) {
			if (window.confirm('Удалить логотип?')) {
				this.requestLandingLogoDelete(id);
			}
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

		deleteLandingLogo(id) {
			this.setState(previousState => {
				const logo = this.getLogoById(id);
				let logos = _.without(previousState.logos, logo);
				logos.forEach((logo, index) => {
					logo.position = index + 1;
				});
				previousState.logos = logos;
				return previousState;
			});
		},

		getLogoById(id) {
			return _.find(this.state.logos, {id});
		},

		getLogoByPosition(position) {
			return _.find(this.state.logos, {position});
		},

		render() {
			const {draggingIndex, isLoading, logos} = this.state;

			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickLandingLogoAdd}
						disabled={isLoading}
						type="button"
						>
						{'Добавить'}
					</button>

					{' '}

					<button
						className="btn btn-warning"
						onClick={this.handleClickStaticGeneratorLanding}
						disabled={isLoading}
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
										onClickEdit={this.handleClickLandingLogoEdit}
										onClickDelete={this.handleClickLandingLogoDelete}
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
		this.handleClickLandingLogoDelete = this.handleClickLandingLogoDelete.bind(this);
	}

	handleClickLandingLogoEdit(e) {
		e.preventDefault();
		this.props.onClickEdit(this.props.id);
	}

	handleClickLandingLogoDelete(e) {
		e.preventDefault();
		this.props.onClickDelete(this.props.id);
	}

	render() {
		const {image, url} = this.props;

		return (
			<div className="">
				<span
					className="landing-logo-list__link"
					title={url}
					>
					<img
						className="landing-logo-list__logo"
						src={image}
						alt=""
						/>
				</span>

				<span className="landing-logo-list__actions">
					<span
						className="landing-logo-list__action text-info"
						title="Отредактировать"
						onClick={this.handleClickLandingLogoEdit}
						>
						<Glyphicon name="pencil"/>
					</span>

					<span
						className="landing-logo-list__action text-danger"
						title="Удалить"
						onClick={this.handleClickLandingLogoDelete}
						>
						<Glyphicon name="remove"/>
					</span>
				</span>
			</div>
		);
	}
}
LandingLogoListItem.propTypes = {
	id: React.PropTypes.number,
	image: React.PropTypes.string,
	onClickEdit: React.PropTypes.func,
	onClickDelete: React.PropTypes.func,
	url: React.PropTypes.string
};
LandingLogoListItem.defaultProps = {
};
