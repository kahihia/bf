/* global document jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import {CATEGORIES_URL} from '../const.js';
import EditCategoryForm from './edit-category-form.jsx';

const CategoryList = React.createClass({
	propTypes: {
		categories: React.PropTypes.array,
		onEditSubmit: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleEditClick(categoryId) {
		jQuery('#edit-category-modal').modal('show');
		const onSubmit = data => {
			jQuery('#edit-category-modal').modal('hide');
			if (this.props.onEditSubmit) {
				this.props.onEditSubmit(data);
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

		return (
			<div className={b('category-list')}>
				<table className={'table table-hover ' + b('category-list', 'table')}>
					<thead>
						<tr>
							<th className={b('category-list', 'table-th', {name: 'id'})}/>

							<th className={b('category-list', 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b('category-list', 'table-th', {name: 'link'})}>
								{'Ссылка'}
							</th>

							<th className={b('category-list', 'table-th', {name: 'edit'})}/>
						</tr>
					</thead>

					<tbody>
						{categories.map(item => {
							return (
								<CategoryListItem
									key={item.id}
									onEditClick={this.handleEditClick}
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
		onEditClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleEditClick() {
		this.props.onEditClick(this.props.id);
	},

	render() {
		const {id, name, slug} = this.props;
		const link = `${CATEGORIES_URL}/${slug}/`;

		return (
			<tr>
				<td className={b('category-list', 'table-td', {name: 'id'})}>
					{`#${id}`}
				</td>

				<td className={b('category-list', 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b('category-list', 'table-td', {name: 'link'})}>
					<a href={link}>
						{link}
					</a>
				</td>

				<td className={b('category-list', 'table-td', {name: 'edit'})}>
					<button
						className="btn btn-sm btn-default"
						onClick={this.handleEditClick}
						type="button"
						>
						{'Редактировать'}
					</button>
				</td>
			</tr>
		);
	}
});
