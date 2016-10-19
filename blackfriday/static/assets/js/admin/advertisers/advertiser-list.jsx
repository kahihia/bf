/* global document _ jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import b from 'b_';
import {hasRole} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import MerchantProfileForm from '../common/merchant-profile-form.jsx';
import FormRow from '../components/form-row.jsx';
import AddAdvertiserForm from './add-advertiser-form.jsx';

const AdvertiserList = React.createClass({
	getInitialState() {
		return {
			data: [],
			isLoading: true,
			merchantFilter: ''
		};
	},

	componentDidMount() {
		this.requestMerchants();
	},

	requestMerchants() {
		xhr({
			url: '/api/advertisers/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				this.setState({data: _.sortBy(data, 'id')});
			}
		});
	},

	handleClickItemEdit(advertiserId, isNew, advertiserName) {
		jQuery('#merchant-profile-modal').modal('show');
		const onSubmit = advertiserData => {
			this.updateAdvertiser(advertiserData);
			jQuery('#merchant-profile-modal').modal('hide');
		};
		ReactDOM.render(
			<MerchantProfileForm
				userId={advertiserId}
				userName={advertiserName}
				key={advertiserId}
				{...{isNew, onSubmit}}
				/>
			,
			document.getElementById('merchant-profile-form')
		);
	},

	handleClickAdvertiserAdd() {
		const $modal = jQuery('#add-advertiser-modal');
		$modal.modal('show');
		const onSubmit = advertiser => {
			if (advertiser) {
				this.setState(previousState => {
					previousState.data.push(advertiser);
					return previousState;
				});
			}

			$modal.one('hidden.bs.modal', () => {
				this.handleClickItemEdit(advertiser.id, true, advertiser.name);
			});
			$modal.modal('hide');
		};
		ReactDOM.render(
			<AddAdvertiserForm
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('add-advertiser-form')
		);
	},

	handleFilterAdvertiser(e) {
		this.setState({merchantFilter: e.target.value});
	},

	updateAdvertiser(advertiserData) {
		this.setState(previousState => {
			const advertiser = _.find(previousState.data, {id: advertiserData.id});
			_.merge(advertiser, advertiserData);

			return previousState;
		});
	},

	render() {
		const {data, isLoading, merchantFilter} = this.state;

		let listStatus = null;

		if (!data.length) {
			if (isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Магазины отсутствуют';
			}
		}

		const isAdmin = hasRole('admin');
		const statusRow = (
			<tr>
				<td
					colSpan={isAdmin ? 5 : 4}
					className="text-center text-muted"
					>
					{listStatus}
				</td>
			</tr>
		);

		let filteredMerchants = data;
		function foo(a, b) {
			if (!a || !b) {
				return;
			}

			return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
		}
		if (merchantFilter) {
			filteredMerchants = _.filter(filteredMerchants, merchant => {
				const {email, name} = merchant;
				if (!name && !email) {
					return false;
				}
				return foo(name, merchantFilter) || foo(email, merchantFilter);
			});
		}

		const className = 'advertiser-list';

		return (
			<div>
				{isAdmin ? (
					<div>
						<button
							className="btn btn-success"
							onClick={this.handleClickAdvertiserAdd}
							type="button"
							>
							{'Добавить'}
						</button>

						<hr/>
					</div>
				) : null}

				<div className="form">
					<FormRow
						label="Поиск рекламодателя"
						placeholder="Email или Название"
						value={merchantFilter}
						onChange={this.handleFilterAdvertiser}
						/>
				</div>

				<div className={b(className)}>
					<table className={'table table-hover ' + b(className, 'table')}>
						<thead>
							<tr>
								<th className={b(className, 'table-th', {name: 'id'})}/>

								<th className={b(className, 'table-th', {name: 'email'})}>
									{'Email'}
								</th>

								<th className={b(className, 'table-th', {name: 'name'})}>
									{'Название'}
								</th>

								<th className={b(className, 'table-th', {name: 'status'})}>
									{'Подтверждён'}
								</th>

								<th className={b(className, 'table-th', {name: 'special'})}>
									{'Особый признак'}
								</th>

								{isAdmin ? (
									<th className={b(className, 'table-th', {name: 'edit'})}/>
								) : null}
							</tr>
						</thead>

						<tbody>
							{filteredMerchants.map(item => {
								const special = item.profile.inner || (item.profile.isSupernova && '«Сверхновая»') || '—';

								return (
									<AdvertiserListItem
										key={item.id}
										onClickEdit={this.handleClickItemEdit}
										isAdmin={isAdmin}
										special={special}
										{...item}
										/>
								);
							})}

							{listStatus ? statusRow : null}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
});

export default AdvertiserList;

const AdvertiserListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		email: React.PropTypes.string,
		isActive: React.PropTypes.bool,
		special: React.PropTypes.string,
		onClickEdit: React.PropTypes.func,
		isAdmin: React.PropTypes.bool
	},

	getDefaultProps() {
		return {};
	},

	handleClickEdit(e) {
		e.preventDefault();

		const props = this.props;
		if (props.onClickEdit) {
			props.onClickEdit(props.id);
		}
	},

	render() {
		const {id, name, email, isActive, special} = this.props;
		const className = 'advertiser-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'id'})}>
					{`#${id}`}
				</td>

				<td className={b(className, 'table-td', {name: 'email'})}>
					<a href={`mailto:${email}`}>
						{email}
					</a>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name ? (
						name
					) : (
						<em className="text-muted">
							{'название не задано'}
						</em>
					)}
				</td>

				<td className={b(className, 'table-td', {name: 'status'})}>
					{isActive ? (
						<Glyphicon
							name="ok"
							className="text-success"
							/>
					) : (
						<Glyphicon
							name="remove"
							className="text-danger"
							/>
					)}
				</td>

				<td className={b(className, 'table-td', {name: 'special'})}>
					{special}
				</td>

				{this.props.isAdmin ? (
					<td className={b(className, 'table-td', {name: 'edit'})}>
						<button
							className="btn btn-sm btn-default"
							onClick={this.handleClickEdit}
							type="button"
							>
							{'Редактировать реквизиты'}
						</button>
					</td>
				) : null}
			</tr>
		);
	}
});
