import React from 'react';
import Pager from './pager.js';

class Carousel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			isAllLoaded: false,
			isInited: false,
			isLoading: false,
			page: null,
			pagesCount: null,
			timer: null
		};

		this.handleClickNext = this.handleClickNext.bind(this);
		this.handleClickPrev = this.handleClickPrev.bind(this);
		this.handleClickPage = this.handleClickPage.bind(this);
	}

	componentDidMount() {
		const {
			ajaxUrl,
			ajaxUrlRoot,
			data,
			isRandom,
			loadPagesCount,
			onNext,
			pagesCount,
			perPage
		} = this.props;

		// if preloaded carousel data
		if (data && data.length === 1 && pagesCount === 1) {
			this.setState({
				isInited: true
			}, () => {
				onNext(data);
			});
			return;
		}

		this.pager = new Pager({
			preloadedData: data && data.length ? data : null,
			perPage,
			pagesCount,
			loadPagesCount,
			isCycled: true,
			isFullfilled: true,
			isRandom,
			ajaxUrl,
			ajaxUrlRoot,
			onNext: (data, page) => {
				this._handleNext(data, page);
			},
			onAllLoaded: () => {
				this.setState({
					isAllLoaded: true
				}, () => {
					if (pagesCount === 1) {
						this._pause();
					}
				});
			},
			onLoadstart: () => {
				this.setState({isLoading: true});
			},
			onLoadend: () => {
				this.setState({isLoading: false});
			},
			onInited: ({pagesCount: initedPagesCount}) => {
				this.setState({
					isInited: true,
					pagesCount: pagesCount || initedPagesCount || 0
				}, () => {
					this._play();
				});
			}
		});
	}

	_handleNext(data, page) {
		this.setState({
			data,
			page
		}, () => {
			this.props.onNext(data);
		});
	}

	_play() {
		this.setState({
			timer: setInterval(() => {
				this.pager.next();
			}, this.props.speed)
		});
	}

	_pause() {
		clearInterval(this.state.timer);
		this.setState({
			timer: null
		});
	}

	handleClickPrev() {
		this._pause();
		this.pager.prev();
		this._play();
	}

	handleClickNext() {
		this._pause();
		this.pager.next();
		this._play();
	}

	handleClickPage(page) {
		this._pause();
		this.pager.gotoPage(page);
		this._play();
	}

	render() {
		const {
			children,
			isControlsShown,
			isPagerShown
		} = this.props;
		const {
			page,
			isInited
		} = this.state;
		const pagesCount = this.state.pagesCount || this.props.pagesCount;
		const isPaged = pagesCount > 1;

		let controls = '';
		let className = 'carousel';
		if (isPaged && isControlsShown) {
			controls = (
				<div className="carousel__controls">
					<div
						className="carousel__prev"
						onClick={this.handleClickPrev}
						/>

					<div
						className="carousel__next"
						onClick={this.handleClickNext}
						/>
				</div>
			);
			className += ' is-paged';
		}

		let pager = '';
		if (isPaged && isPagerShown) {
			pager = (
				<CarouselPager
					pagesCount={pagesCount}
					page={page}
					onPage={this.handleClickPage}
					/>
			);
			className += ' is-pager';
		}

		if (isInited) {
			return (
				<div className={className}>
					<div className="carousel__content">
						{children}
					</div>

					{controls}

					{pager}
				</div>
			);
		}

		return (<div/>);
	}
}
Carousel.propTypes = {
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	children: React.PropTypes.element,
	data: React.PropTypes.array,
	isControlsShown: React.PropTypes.bool,
	isPagerShown: React.PropTypes.bool,
	isRandom: React.PropTypes.bool,
	loadPagesCount: React.PropTypes.number,
	onNext: React.PropTypes.func,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	speed: React.PropTypes.number
};

export default Carousel;

class CarouselPager extends React.Component {
	constructor() {
		super();

		this.handleClickPage = this.handleClickPage.bind(this);
	}

	handleClickPage(page) {
		this.props.onPage(page);
	}

	render() {
		let pagerPages = [];
		const page = this.props.page;
		for (let i = 1; i <= this.props.pagesCount; i += 1) {
			pagerPages.push(
				<CarouselPage
					key={i}
					page={i}
					isActive={i === page}
					onClick={this.handleClickPage}
					/>
			);
		}

		return (
			<div className="carousel__pager">
				{pagerPages}
			</div>
		);
	}
}
CarouselPager.propTypes = {
	onPage: React.PropTypes.func,
	page: React.PropTypes.number,
	pagesCount: React.PropTypes.number
};

class CarouselPage extends React.Component {
	constructor() {
		super();

		this.handleClickPage = this.handleClickPage.bind(this);
	}

	handleClickPage() {
		this.props.onClick(this.props.page);
	}

	render() {
		let className = 'carousel__page';
		if (this.props.isActive) {
			className += ' is-active';
		}

		return (
			<div
				className={className}
				onClick={this.handleClickPage}
				/>
		);
	}
}
CarouselPage.propTypes = {
	isActive: React.PropTypes.bool,
	onClick: React.PropTypes.func,
	page: React.PropTypes.number
};
