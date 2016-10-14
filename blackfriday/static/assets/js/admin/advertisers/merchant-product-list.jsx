/* global window document jQuery _ toastr */
/* eslint-disable no-alert */
/* eslint react/require-optimization: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {processErrors} from '../utils.js';
import MerchantProductsAddForm from './merchant-products-add-form.jsx';
import ProductsTable from './products-table.jsx';
import ProductsNewTable from './products-new-table.jsx';

const className = 'merchant-product-list';

class MerchantProductList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			products: [],
			productsNew: []
		};

		this.handleClickProductsAdd = this.handleClickProductsAdd.bind(this);
		this.handleClickProductsDelete = this.handleClickProductsDelete.bind(this);
		this.handleSubmitProductsNew = this.handleSubmitProductsNew.bind(this);
	}

	componentWillMount() {
		this.requestProducts();
	}

	requestProducts() {
		this.setState({isLoading: true});

		const {id} = this.props;

		xhr({
			url: `/api/merchants/${id}/products/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					this.setState({products: _.sortBy(data, 'id')});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось получить список товаров');
					break;
				}
			}
		});
	}

	requestProductsDelete() {
		this.setState({isLoading: true});

		const {id} = this.props;

		xhr({
			url: `/api/merchants/${id}/products/`,
			method: 'DELETE',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 204: {
					this.setState({products: []});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось удалить товары');
					break;
				}
			}
		});
	}

	openMerchantProductsAddModal() {
		jQuery('#merchant-products-add-modal').modal('show');
		const {id} = this.props;
		const onSubmit = data => {
			jQuery('#merchant-products-add-modal').modal('hide');
			this.merchantProductsAdd(data);
		};
		ReactDOM.render(
			<MerchantProductsAddForm
				{...{
					id,
					onSubmit
				}}
				/>
			,
			document.getElementById('merchant-products-add-form')
		);
	}

	handleClickProductsAdd() {
		this.openMerchantProductsAddModal();
	}

	handleClickProductsDelete() {
		if (window.confirm('Удалить товары?')) {
			this.requestProductsDelete();
		}
	}

	handleSubmitProductsNew(products) {
		this.setState({
			productsNew: [],
			products
		});
	}

	getProductById(id) {
		return _.find(this.state.products, {id});
	}

	merchantProductsAdd(data) {
		this.setState(previousState => {
			previousState.productsNew = data;
			return previousState;
		});
	}

	render() {
		const {
			isLoading,
			products,
			productsNew
		} = this.state;
		const {
			availableCategories,
			id
		} = this.props;

		return (
			<div className="shop-edit-block">
				<h2 className={b(className, 'title')}>
					{'Загрузить товары'}
				</h2>

				<div className="panel panel-default">
					<div className="panel-body">
						<p>
							{'Товары у которых в стране производства указано: Россия, Russia, РФ, Российская Федерация дополнительно попадают в раздел "Товары российского производства".'}
						</p>

						<p>
							<button
								className="btn btn-default"
								onClick={this.handleClickProductsAdd}
								disabled={isLoading}
								type="button"
								>
								{'Загрузить'}
							</button>

							{products.length ? (
								<span>
									{' '}

									<button
										className="btn btn-danger"
										onClick={this.handleClickProductsDelete}
										disabled={isLoading}
										type="button"
										>
										{'Удалить'}
									</button>
								</span>
							) : null}
						</p>

						{productsNew.length ? (
							<ProductsNewTable
								products={productsNew}
								merchantId={id}
								onSubmit={this.handleSubmitProductsNew}
								{...{
									availableCategories
								}}
								/>
						) : null}

						{products.length ? (
							<ProductsTable
								merchantId={id}
								{...{
									availableCategories,
									products
								}}
								/>
						) : null}
					</div>
				</div>
			</div>
		);
	}
}
MerchantProductList.propTypes = {
	availableCategories: React.PropTypes.array,
	id: React.PropTypes.number.isRequired
};
MerchantProductList.defaultProps = {
};

export default MerchantProductList;
