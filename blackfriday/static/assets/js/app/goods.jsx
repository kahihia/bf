/* global React */
/* eslint "react/require-optimization": "off" */

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

class Goods extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};
		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({data: data});
	}

	render() {
		// For merchant preview
		if (this.props.data.length && this.props.pages === 1) {
			return <ProductList data={this.props.data}/>;
		}

		return (
			<Paged
				{...this.props}
				loadMoreText={'Показать больше товаров'}
				onNext={this.handleNext}
				>
				<ProductList data={this.state.data}/>
			</Paged>
		);
	}
}
Goods.propTypes = {
	data: React.PropTypes.array,
	pages: React.PropTypes.number,
	perPage: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	loadPagesCount: React.PropTypes.number,
	isRandom: React.PropTypes.bool,
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	speed: React.PropTypes.number,
	onNext: React.PropTypes.func,
	loadMoreText: React.PropTypes.string
};

export default Goods;
