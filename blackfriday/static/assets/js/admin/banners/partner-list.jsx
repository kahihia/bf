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
		const className = 'partner-list';

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'logo'})}>
								{'Логотип'}
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b(className, 'table-th', {name: 'link'})}>
								{'Ссылка'}
							</th>

							<th className={b(className, 'table-th', {name: 'edit'})}/>
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
		const className = 'partner-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'logo'})}>
					<span className={b(className, 'logo-placeholder')}>
						{image ? (
							<img
								src={image}
								alt=""
								/>
						) : null}
					</span>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'link'})}>
					<a href={url}>
						{url}
					</a>
				</td>

				<td className={b(className, 'table-td', {name: 'edit'})}>
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
