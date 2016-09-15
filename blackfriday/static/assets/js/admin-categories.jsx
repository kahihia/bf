/* global document toastr _ jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import AddCategoryForm from './admin/catalog/add-category-form.jsx';
import CategoryList from './admin/catalog/category-list.jsx';

(function () {
	'use strict';

	const AdminCategories = React.createClass({
		getInitialState() {
			return {
				categories: []
			};
		},

		componentWillMount() {
			this.requestCategories();
		},

		requestCategories() {
			xhr({
				url: '/api/categories/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({categories: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список категорий');
				}
			});
		},

		handleClickCategoryAdd() {
			jQuery('#add-category-modal').modal('show');
			const onSubmit = category => {
				this.handleCategoryAdd(category);
				jQuery('#add-category-modal').modal('hide');
			};
			ReactDOM.render(
				<AddCategoryForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-category-form')
			);
		},

		handleCategoryAdd(category) {
			if (!category) {
				return;
			}

			this.setState(previousState => {
				previousState.categories.push(category);
				return previousState;
			});
		},

		handleSubmitEdit(data) {
			if (!data) {
				return;
			}

			this.setState(previousState => {
				const category = this.getCategoryById(data.id);
				_.merge(category, data);
				return previousState;
			});
		},

		getCategoryById(categoryId) {
			return _.find(this.state.categories, {id: categoryId});
		},

		render() {
			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickCategoryAdd}
						type="button"
						>
						{'Добавить'}
					</button>

					<hr/>

					<CategoryList
						categories={this.state.categories}
						onSubmitEdit={this.handleSubmitEdit}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-categories');
	ReactDOM.render(<AdminCategories/>, block);
})();
