/* global window document toastr _ jQuery */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import update from 'react/lib/update';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import Glyphicon from './admin/components/glyphicon.jsx';
import AddLandingLogoForm from './admin/landing/add-landing-logo-form.jsx';
import EditLandingLogoForm from './admin/landing/edit-landing-logo-form.jsx';
import LandingLogoList from './admin/landing/landing-logo-list.jsx';

class AdminLanding extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			logos: [],
			isLoading: false
		};

		this.handleClickLandingLogoAdd = this.handleClickLandingLogoAdd.bind(this);
		this.handleClickLandingLogoEdit = this.handleClickLandingLogoEdit.bind(this);
		this.handleClickLandingLogoDelete = this.handleClickLandingLogoDelete.bind(this);
		this.handleClickStaticGeneratorLanding = this.handleClickStaticGeneratorLanding.bind(this);
		this.handleLandingLogoDrop = this.handleLandingLogoDrop.bind(this);
		this.moveLogo = this.moveLogo.bind(this);
		this.findLogo = this.findLogo.bind(this);
	}

	componentWillMount() {
		this.requestLandingLogos();
	}

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
	}

	requestLandingLogosReorder() {
		this.setState({isLoading: true});

		const json = this.state.logos.map(item => {
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
	}

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
				toastr.error('Не удалось сгенерировать лэндинг. Проверьте, что загружены партнёры и логотипы');
			}
		});
	}

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
	}

	moveLogo(id, atIndex) {
		const {logo, index} = this.findLogo(id);
		this.setState(update(this.state, {
			logos: {
				$splice: [
					[index, 1],
					[atIndex, 0, logo]
				]
			}
		}));
	}

	findLogo(id) {
		const {logos} = this.state;
		const logo = logos.filter(c => c.id === id)[0];

		return {
			logo,
			index: logos.indexOf(logo)
		};
	}

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
	}

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
	}

	handleClickLandingLogoDelete(id) {
		if (window.confirm('Удалить логотип?')) {
			this.requestLandingLogoDelete(id);
		}
	}

	handleLandingLogoDrop() {
		this.requestLandingLogosReorder();
	}

	handleClickStaticGeneratorLanding() {
		this.requestStaticGeneratorLanding();
	}

	addLandingLogo(data) {
		if (data) {
			this.setState(previousState => {
				previousState.logos.push(data);
				return previousState;
			});
		}
	}

	editLandingLogo(data) {
		if (data) {
			const logo = this.getLogoById(data.id);
			_.merge(logo, data);
			this.forceUpdate();
		}
	}

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
	}

	getLogoById(id) {
		return _.find(this.state.logos, {id});
	}

	getLogoByPosition(position) {
		return _.find(this.state.logos, {position});
	}

	render() {
		const {isLoading, logos} = this.state;

		return (
			<div>
				<button
					className="btn btn-success"
					onClick={this.handleClickLandingLogoAdd}
					disabled={isLoading}
					type="button"
					>
					{'Добавить логотип'}
				</button>

				{' '}

				<button
					className="btn btn-warning"
					onClick={this.handleClickStaticGeneratorLanding}
					disabled={isLoading}
					type="button"
					>
					<Glyphicon name="refresh"/>
					{' Сгенерировать лэндинг'}
				</button>

				<hr/>

				<LandingLogoList
					logos={logos}
					moveLogo={this.moveLogo}
					findLogo={this.findLogo}
					onClickEdit={this.handleClickLandingLogoEdit}
					onClickDelete={this.handleClickLandingLogoDelete}
					onDrop={this.handleLandingLogoDrop}
					/>
			</div>
		);
	}
}
AdminLanding.propTypes = {
};
AdminLanding.defaultProps = {
};

const block = document.getElementById('admin-landing');
ReactDOM.render(<AdminLanding/>, block);
