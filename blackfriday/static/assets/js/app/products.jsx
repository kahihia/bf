import React from 'react';
import Paged from './paged.jsx';
import ShortProduct from './short-product.jsx';

class ProductList extends React.Component {
	render() {
		return (
			<div className="product-list">
				{this.props.data.map(item => (
					<div
						key={item.id}
						className="product-list__item"
						>
						<ShortProduct data={item}/>
					</div>
				))}
			</div>
		);
	}
}
ProductList.propTypes = {
	data: React.PropTypes.array
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
		// For merchant preview
		if (this.props.data.length && this.props.pagesCount === 1) {
			return <ProductList data={this.props.data}/>;
		}

		return (
			<Paged
				{...this.props}
				loadMoreText={'Показать больше товаров'}
				onNext={this.handleNext}
				>
				{this.state.data.length ? (
					<ProductList data={this.state.data}/>
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
	speed: React.PropTypes.number
};

export default Products;
