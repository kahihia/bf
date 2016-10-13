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

const className = 'merchant-product-list';

class MerchantProductList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			products: []
		};

		this.handleClickProductsAdd = this.handleClickProductsAdd.bind(this);
		this.handleClickDelete = this.handleClickDelete.bind(this);
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
					this.setState({products: data});
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

	handleClickDelete() {
		if (window.confirm('Удалить товары?')) {
			this.requestProductsDelete();
		}
	}

	getProductById(id) {
		return _.find(this.state.products, {id});
	}

	merchantProductsAdd(data) {
		this.setState(previousState => {
			previousState.banners = data;
			return previousState;
		});
	}

	render() {
		const {products} = this.state;

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
								type="button"
								>
								{'Загрузить'}
							</button>
						</p>

						<ProductsTable
							{...{
								products
							}}
							/>
					</div>
				</div>
			</div>
		);
	}
}
MerchantProductList.propTypes = {
	id: React.PropTypes.number.isRequired
};
MerchantProductList.defaultProps = {
};

export default MerchantProductList;