/* global document jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import {hasRole} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import EditSpecialForm from './edit-special-form.jsx';

const SpecialList = React.createClass({
	propTypes: {
		specials: React.PropTypes.array,
		isLoading: React.PropTypes.bool,
		onClickSpecialDelete: React.PropTypes.func,
		onSubmitEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickDelete(id) {
		this.props.onClickSpecialDelete(id);
	},

	handleClickEdit(specialId) {
		jQuery('#edit-special-modal').modal('show');
		const onSubmit = data => {
			jQuery('#edit-special-modal').modal('hide');
			if (this.props.onSubmitEdit) {
				this.props.onSubmitEdit(data);
			}
		};
		ReactDOM.render(
			<EditSpecialForm
				specialId={specialId}
				key={specialId}
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('edit-special-form')
		);
	},

	render() {
		const {specials, isLoading} = this.props;
		const className = 'special-list';

		let listStatus = null;

		if (!specials.length) {
			if (isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Предложения партнёров отсутствуют';
			}
		}

		const isAdmin = hasRole('admin');
		const statusRow = (
			<tr>
				<td
					colSpan={isAdmin ? 4 : 3}
					className="text-center text-muted"
					>
					{listStatus}
				</td>
			</tr>
		);

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b(className, 'table-th', {name: 'description'})}>
								{'Описание'}
							</th>

							<th className={b(className, 'table-th', {name: 'link'})}>
								{'Документ'}
							</th>

							{isAdmin ? (
								<th className={b(className, 'table-th', {name: 'edit'})}/>
							) : null}
						</tr>
					</thead>

					<tbody>
						{specials.map(item => {
							return (
								<SpecialListItem
									key={item.id}
									onClickEdit={this.handleClickEdit}
									onClickDelete={this.handleClickDelete}
									{...item}
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

export default SpecialList;

const SpecialListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		description: React.PropTypes.string,
		document: React.PropTypes.string,
		onClickDelete: React.PropTypes.func,
		onClickEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickDelete() {
		this.props.onClickDelete(this.props.id);
	},

	handleClickEdit() {
		this.props.onClickEdit(this.props.id);
	},

	render() {
		const {name, description, document} = this.props;
		const isAdmin = hasRole('admin');
		const className = 'special-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'description'})}>
					{description}
				</td>

				<td className={b(className, 'table-td', {name: 'link'})}>
					<a className="btn btn-sm btn-default" href={document} target="_blank" rel="noopener noreferrer">
						<Glyphicon name="new-window"/>
						{' Просмотреть'}
					</a>
				</td>

				{isAdmin ? (
					<td className={b(className, 'table-td', {name: 'edit'})}>
						<button
							className="btn btn-sm btn-block btn-default"
							onClick={this.handleClickEdit}
							type="button"
							>
							{'Редактировать'}
						</button>

						<button
							className="btn btn-sm btn-block btn-danger"
							onClick={this.handleClickDelete}
							type="button"
							>
							{'Удалить'}
						</button>
					</td>
				) : null}
			</tr>
		);
	}
});
