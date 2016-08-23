/* global React, ReactDOM, document, jQuery, _ */

import xhr from 'xhr';

import {hasRole} from '../utils.js';
import MerchantProfileForm from '../common/merchant-profile-form.jsx';
import FormRow from '../components/form-row.jsx';
import AddAdvertiserForm from './add-advertiser-form.jsx';
import MerchantItem from './merchant-item.jsx';

const MerchantList = React.createClass({
	getInitialState() {
		return {
			data: [],
			isLoading: true,
			merchantFilter: ''
		};
	},

	componentDidMount() {
		xhr.get('/admin/merchants', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({
					data: data
				});
			}
			this.setState({
				isLoading: false
			});
		});
	},

	handleClickItemEdit(advertiserId, isNew) {
		jQuery('#merchant-profile-modal').modal('show');
		const onSubmit = () => {
			jQuery('#merchant-profile-modal').modal('hide');
		};
		ReactDOM.render(
			<MerchantProfileForm
				userId={advertiserId}
				key={advertiserId}
				onSubmit={onSubmit}
				isNew={isNew}
				/>
			,
			document.getElementById('merchant-profile-form')
		);
	},

	handleClickAddAdvertiser() {
		const $modal = jQuery('#add-advertiser-modal');
		$modal.modal('show');
		const onSubmit = advertiserId => {
			$modal.one('hidden.bs.modal', () => {
				this.handleClickItemEdit(advertiserId, true);
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
				<td colSpan={isAdmin ? 4 : 3} className="text-center text-muted">
					{listStatus}
				</td>
			</tr>
		);

		let filteredMerchants = data;
		if (merchantFilter) {
			filteredMerchants = _.filter(filteredMerchants, merchant => {
				const name = merchant.merchant_name;
				if (!name) {
					return false;
				}
				return name.toLowerCase().indexOf(merchantFilter.toLowerCase()) > -1;
			});
		}

		return (
			<div>
				{isAdmin ? (
					<p>
						<button
							className="btn btn-success"
							onClick={this.handleClickAddAdvertiser}
							type="button"
							>
							{'Добавить'}
						</button>
					</p>
				) : null}

				<div className="form">
					<FormRow
						label="Поиск рекламодателя"
						value={merchantFilter}
						onChange={this.handleFilterAdvertiser}
						/>
				</div>

				<table className="table table-striped">
					<thead>
						<tr>
							{isAdmin ? (
								<th/>
							) : null}
							<th/>
							<th>Название</th>
							<th>Юридическое лицо</th>
						</tr>
					</thead>
					<tbody>
						{filteredMerchants.map(merchantItem => {
							return (
								<MerchantItem
									key={merchantItem.id}
									data={merchantItem}
									onClickEdit={this.handleClickItemEdit}
									isAdmin={isAdmin}
									/>
							);
						})}

						{listStatus ? statusRow : null}
					</tbody>
				</table>
			</div>
		);
	}
});

export default MerchantList;
