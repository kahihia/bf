import React from 'react';
import Paged from './paged.jsx';
import ShortProduct from './short-product.jsx';

class ProductList extends React.Component {
	render() {
		const {
			data,
			showCategory
		} = this.props;

		return (
			<div className="product-list">
				{data.map(item => (
					<div
						key={item.id}
						className="product-list__item"
						>
						<ShortProduct
							data={item}
							showCategory={showCategory}
							/>
					</div>
				))}
			</div>
		);
	}
}
ProductList.propTypes = {
	data: React.PropTypes.array,
	showCategory: React.PropTypes.bool
};
ProductList.defaultProps = {
	showCategory: true
};

class Products extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};

		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({data});
	}

	render() {
		const props = this.props;

		// For merchant preview
		if (props.data.length && props.pagesCount === 1) {
			return (
				<ProductList
					data={props.data}
					showCategory={props.showCategory}
					/>
			);
		}

		return (
			<Paged
				{...props}
				loadMoreText={'Показать больше товаров'}
				onNext={this.handleNext}
				>
				{this.state.data.length ? (
					<ProductList
						data={this.state.data}
						showCategory={props.showCategory}
						/>
				) : null}
			</Paged>
		);
	}
}
Products.propTypes = {
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	data: React.PropTypes.array,
	isRandom: React.PropTypes.bool,
	loadMoreText: React.PropTypes.string,
	loadPagesCount: React.PropTypes.number,
	onNext: React.PropTypes.func,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	showCategory: React.PropTypes.bool,
	showMerchant: React.PropTypes.bool,
	speed: React.PropTypes.number
};
Products.defaultProps = {
};

export default Products;
