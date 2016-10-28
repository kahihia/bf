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
import DownloadFile from '../common/download-file.jsx';

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

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/products/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					const products = _.sortBy(data, 'id');
					this.setState({products}, () => {
						this.props.onChange({products});
					});
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

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/products/`,
			method: 'DELETE',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 204: {
					const products = [];
					this.setState({products}, () => {
						this.props.onChange({products});
					});
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
		const {merchantId} = this.props;
		const onSubmit = data => {
			jQuery('#merchant-products-add-modal').modal('hide');
			this.merchantProductsAdd(data);
		};
		ReactDOM.render(
			<MerchantProductsAddForm
				{...{
					merchantId,
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
		if (window.confirm('Удалить все товары?')) {
			this.requestProductsDelete();
		}
	}

	handleSubmitProductsNew(newProducts) {
		const {products: previousProducts} = this.state;
		const productsNew = [];
		const products = previousProducts.concat(newProducts);

		this.setState({
			productsNew,
			products
		}, () => {
			this.props.onChange({products, productsNew});
		});
	}

	getProductById(id) {
		return _.find(this.state.products, {id});
	}

	merchantProductsAdd(productsNew) {
		this.setState({productsNew}, () => {
			this.props.onChange({productsNew});
		});
	}

	render() {
		const {
			isLoading,
			products,
			productsNew
		} = this.state;
		const {
			categoriesAvailable,
			limits,
			merchantId
		} = this.props;

		if (!limits.products && !products.length) {
			return null;
		}

		let productsCountAvailable = limits.products - (products.length + productsNew.length);
		if (isNaN(productsCountAvailable) || productsCountAvailable < 0) {
			productsCountAvailable = 0;
		}

		return (
			<div className="shop-edit-block">
				<h2 className={b(className, 'title')}>
					{'Загрузить товары'}

					<DownloadFile
						href="/RBF_feed_howto.pdf"
						name="Инструкция по заполнению товарного файла"
						/>

					<DownloadFile
						href="/RBF_feed_template.xlsx"
						name="Шаблон файла для загрузки товаров"
						/>
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
										{'Удалить все товары'}
									</button>
								</span>
							) : null}

							<span
								className="text-muted"
								style={{marginLeft: '22px'}}
								>
								{'Доступно '}

								<strong>
									{productsCountAvailable}
								</strong>

								{' из '}

								<strong>
									{limits.products}
								</strong>
							</span>
						</p>

						{productsNew.length ? (
							<ProductsNewTable
								products={productsNew}
								onSubmit={this.handleSubmitProductsNew}
								{...{
									categoriesAvailable,
									merchantId
								}}
								/>
						) : null}

						{products.length ? (
							<ProductsTable
								{...{
									categoriesAvailable,
									limits,
									merchantId,
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
	categoriesAvailable: React.PropTypes.array,
	limits: React.PropTypes.object,
	merchantId: React.PropTypes.number.isRequired,
	onChange: React.PropTypes.func
};
MerchantProductList.defaultProps = {
};

export default MerchantProductList;
