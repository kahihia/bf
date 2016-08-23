/* global React */

import LoadMore from './load-more.jsx';
import Pager from './pager.js';

class Paged extends React.Component {
	constructor() {
		super();
		this.state = {
			data: [],
			page: null,
			isLoading: false,
			isAllLoaded: false,
			isInited: false
		};
		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		const props = this.props;

		this.pager = new Pager({
			perPage: props.perPage,
			pagesCount: props.pages,
			loadPagesCount: props.loadPagesCount,
			isCycled: false,
			isRandom: props.isRandom,
			ajaxUrl: props.ajaxUrl,
			onNext: (data, page) => {
				this.handleNext(data, page);
			},
			onAllLoaded: () => {
				this.setState({
					isAllLoaded: true
				});
			},
			onLoadstart: () => {
				this.setState({
					isLoading: true
				});
			},
			onLoadend: () => {
				this.setState({
					isLoading: false
				});
			},
			onInited: () => {
				this.setState({
					isInited: true
				});
			}
		});
	}

	handleNext(data, page) {
		data = this.state.data.concat(data);
		this.setState({
			data: data,
			page: page
		}, () => {
			this.props.onNext(data);
		});
	}

	handleClick() {
		this.pager.next();
	}

	render() {
		if (this.state.isInited) {
			return (
				<div className="special-offers">
					{this.props.children}
					{this.state.isAllLoaded ? null : (
						<LoadMore
							key={this.state.page}
							onClick={this.handleClick}
							text={this.props.loadMoreText}
							disabled={this.state.isLoading}
							/>
					)}
				</div>
			);
		}

		return (<div/>);
	}
}
Paged.propTypes = {
	data: React.PropTypes.array,
	pages: React.PropTypes.number,
	perPage: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	loadPagesCount: React.PropTypes.number,
	isRandom: React.PropTypes.bool,
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	className: React.PropTypes.string,
	speed: React.PropTypes.number,
	onNext: React.PropTypes.func,
	loadMoreText: React.PropTypes.string,
	children: React.PropTypes.element
};

export default Paged;
