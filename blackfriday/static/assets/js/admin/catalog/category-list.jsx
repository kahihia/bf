/* global document jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import {getFullUrl} from '../utils.js';
import EditCategoryForm from './edit-category-form.jsx';

const CategoryList = React.createClass({
	propTypes: {
		categories: React.PropTypes.array,
		onSubmitEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickEdit(categoryId) {
		jQuery('#edit-category-modal').modal('show');
		const onSubmit = data => {
			jQuery('#edit-category-modal').modal('hide');
			if (this.props.onSubmitEdit) {
				this.props.onSubmitEdit(data);
			}
		};
		ReactDOM.render(
			<EditCategoryForm
				categoryId={categoryId}
				key={categoryId}
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('edit-category-form')
		);
	},

	render() {
		const {categories} = this.props;
		const className = 'category-list';

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'id'})}/>

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
						{categories.map(item => {
							return (
								<CategoryListItem
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

export default CategoryList;

const CategoryListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		slug: React.PropTypes.string,
		onClickEdit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickEdit() {
		this.props.onClickEdit(this.props.id);
	},

	render() {
		const {id, name, slug} = this.props;
		const link = `${getFullUrl('categories')}${slug}/`;
		const className = 'category-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'id'})}>
					{`#${id}`}
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'link'})}>
					<a href={link}>
						{link}
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
