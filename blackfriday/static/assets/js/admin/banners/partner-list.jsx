/* global document jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import EditPartnerForm from './edit-partner-form.jsx';

const PartnerList = React.createClass({
	propTypes: {
		partners: React.PropTypes.array,
		onSubmitEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickEdit(partnerId) {
		jQuery('#edit-partner-modal').modal('show');
		const onSubmit = data => {
			jQuery('#edit-partner-modal').modal('hide');
			if (this.props.onSubmitEdit) {
				this.props.onSubmitEdit(data);
			}
		};
		ReactDOM.render(
			<EditPartnerForm
				partnerId={partnerId}
				key={partnerId}
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('edit-partner-form')
		);
	},

	render() {
		const {partners} = this.props;

		return (
			<div className={b('partner-list')}>
				<table className={'table table-hover ' + b('partner-list', 'table')}>
					<thead>
						<tr>
							<th className={b('partner-list', 'table-th', {name: 'logo'})}>
								{'Логотип'}
							</th>

							<th className={b('partner-list', 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b('partner-list', 'table-th', {name: 'link'})}>
								{'Ссылка'}
							</th>

							<th className={b('partner-list', 'table-th', {name: 'edit'})}/>
						</tr>
					</thead>

					<tbody>
						{partners.map(item => {
							return (
								<PartnerListItem
									key={item.id}
									onClickEdit={this.handleClickEdit}
									{...item}
									/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

export default PartnerList;

const PartnerListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		image: React.PropTypes.string,
		name: React.PropTypes.string,
		url: React.PropTypes.string,
		onClickEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickEdit() {
		this.props.onClickEdit(this.props.id);
	},

	render() {
		const {image, name, url} = this.props;

		return (
			<tr>
				<td className={b('partner-list', 'table-td', {name: 'logo'})}>
					<span className={b('partner-list', 'logo-placeholder')}>
						{image ? (
							<img
								src={image}
								alt=""
								/>
						) : null}
					</span>
				</td>

				<td className={b('partner-list', 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b('partner-list', 'table-td', {name: 'link'})}>
					<a href={url}>
						{url}
					</a>
				</td>

				<td className={b('partner-list', 'table-td', {name: 'edit'})}>
					<button
						className="btn btn-sm btn-default"
						onClick={this.handleClickEdit}
						type="button"
						>
						{'Редактировать'}
					</button>
				</td>
			</tr>
		);
	}
});
