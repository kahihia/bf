/* global window document */
/* eslint react/no-danger: 0 */
/* eslint react/require-optimization: 0 */

require('css/app.styl');

import React from 'react';
import ReactDOM from 'react-dom';

import Scroll from 'react-scroll';

import Tabs from './app/react-simpletabs.jsx';
import {categoriesSorting, convertNodeToDangerouslyHTML} from './app/utils.js';

import SimpleMenu from './app/simple-menu.jsx';
import Header from './app/header.jsx';
import SidebarCats from './app/sidebar-cats.jsx';

import Superbanner from './app/superbanner.jsx';
import Goods from './app/goods.jsx';
import {Merchants, AllMerchants} from './app/merchants.jsx';
import Partners from './app/partners.jsx';
import Banners from './app/banners.jsx';

(function () {
	'use strict';

	// Clone settings
	const DATA = JSON.parse(JSON.stringify(window.DATA));

	// Site Header
	ReactDOM.render(<Header headerMenu={DATA.headerMenu} categories={DATA.categories}/>, document.getElementById('header'));
	// Site Footer menu
	ReactDOM.render(<SimpleMenu list={DATA.footerCats}/>, document.getElementById('footer-cats'));

	// Site Sidebar menu
	var sidebarCats = document.querySelector('.left-sidebar__sidebar-cats');
	if (!window.isSideMenuHidden && sidebarCats) {
		ReactDOM.render(<SidebarCats list={DATA.categories} isSideShown={DATA.isSideShown}/>, sidebarCats);
	}

	// Russian Goods page Sidebar menu
	const categoriesRus = document.getElementById('categories-rus');
	if (categoriesRus && DATA.categoriesRus) {
		const sideHiddenBlock = document.getElementById('sidebar-hidden-block');
		if (sideHiddenBlock) {
			sideHiddenBlock.style.display = 'none';
		}
		const m = (
			<div className="categories-rus">
				<div className="categories-rus__title">Товары российского производства</div>
				<SimpleMenu list={DATA.categoriesRus} sorting={categoriesSorting}/>
			</div>
		);
		ReactDOM.render(m, categoriesRus);
	}

	// Site Superbanner
	const superbanner = document.getElementById('superbanner');
	if (superbanner && DATA.superbanners && DATA.superbanners.pages) {
		ReactDOM.render(<Superbanner {...DATA.superbanners}/>, superbanner);
	}

	// Main page
	class PseudoLink extends React.Component {
		constructor(props) {
			super(props);
			this.handleClick = this.handleClick.bind(this);
		}

		handleClick() {
			this.props.onClick(this.props.tabIndex);
		}

		render() {
			return (
				<Scroll.Link
					className="pseudo-link"
					to={this.props.anchorName}
					offset={-100}
					smooth
					onClick={this.handleClick}
					>
					<span>
						{this.props.children}
					</span>
				</Scroll.Link>
			);
		}
	}
	PseudoLink.propTypes = {
		tabIndex: React.PropTypes.number,
		anchorName: React.PropTypes.string,
		onClick: React.PropTypes.func,
		children: React.PropTypes.node
	};

	// Main page
	const MainTeaserFooter = React.createClass({
		handleClick() {
			updateMainTabs(2);
		},

		render() {
			return (
				<div className="main-teaser__footer">
					<PseudoLink
						anchorName="anchor-goods"
						onClick={this.handleClick}
						key={'anchor-goods'}
						>
						{'Все лучшие товары'}
					</PseudoLink>
				</div>
			);
		}
	});
	const mainTeaserFooter = document.getElementById('main-teaser-footer');
	if (mainTeaserFooter) {
		ReactDOM.render(<MainTeaserFooter/>, mainTeaserFooter);
	}

	// Retail Rocket
	const RRMarkupBlock = ({id, categoryId}) => (
		<div
			data-retailrocket-markup-block={id}
			data-category-id={categoryId}
			/>
	);
	RRMarkupBlock.propTypes = {
		id: React.PropTypes.string.isRequired,
		categoryId: React.PropTypes.string
	};

	// Main page
	const MainTabs = React.createClass({
		propTypes: {
			tabActive: React.PropTypes.number
		},

		getDefaultProps() {
			return {
				tabActive: 1
			};
		},

		render() {
			return (
				<div>
					<Scroll.Element name="anchor-goods"/>
					<Tabs tabActive={this.props.tabActive}>
						<Tabs.Panel title={(<span>Лучшие акции</span>)}>
							<RRMarkupBlock
								key="571e14d19872e50edcded355"
								id="571e14d19872e50edcded355"
								categoryId="00"
								/>
							<Banners {...DATA.banners}/>
						</Tabs.Panel>
						<Tabs.Panel title={(<span>Лучшие товары</span>)}>
							<RRMarkupBlock
								key="571e13c565bf192790e915fc"
								id="571e13c565bf192790e915fc"
								/>
							<Goods {...DATA.goods}/>
						</Tabs.Panel>
					</Tabs>
				</div>
			);
		}
	});
	const mainTabs = document.getElementById('main-tabs');
	if (mainTabs) {
		ReactDOM.render(<MainTabs key={'main-tabs'}/>, mainTabs);
	}
	// Для переключения в верхнем табе
	function updateMainTabs(activeTab) {
		ReactDOM.render(<MainTabs tabActive={activeTab} key={'main-tabs'}/>, mainTabs);
	}

	// Action page
	// Category page
	class MyTabs extends React.Component {
		render() {
			const categoryId = DATA.categoryId || 'category_id';
			const virtualCategoryId = `${categoryId}0`;

			return (
				<Tabs tabActive={this.props.tabActive || 1}>
					<Tabs.Panel title={(<span>{'Акции'}</span>)}>
						{this.props.withRr ? (
							<RRMarkupBlock
								key="571e18199872e50edcded399"
								id="571e18199872e50edcded399"
								categoryId={virtualCategoryId}
								/>
						) : null}
						<Banners {...DATA.banners}/>
					</Tabs.Panel>
					<Tabs.Panel title={(<span>{'Лучшие товары'}</span>)}>
						{this.props.withRr ? (
							<RRMarkupBlock
								key="571e162865bf192790e91614"
								id="571e162865bf192790e91614"
								categoryId={categoryId}
								/>
						) : null}
						<Goods {...DATA.goods}/>
					</Tabs.Panel>
				</Tabs>
			);
		}
	}
	MyTabs.propTypes = {
		tabActive: React.PropTypes.number,
		withRr: React.PropTypes.bool
	};
	const tabs = document.getElementById('tabs');
	if (tabs) {
		const activeTab = /tab/.test(window.location.hash) ? 2 : 1;
		ReactDOM.render(<MyTabs tabActive={activeTab} withRr={tabs.getAttribute('data-with-rr') === 'true'}/>, tabs);
	}

	// Russian Goods page
	// Merchant page
	const goods = document.getElementById('goods');
	if (DATA.goods && goods) {
		ReactDOM.render(<Goods {...DATA.goods}/>, goods);
	}

	// Main page
	// Category page
	const merchants = document.getElementById('merchants');
	if (DATA.merchants && merchants) {
		ReactDOM.render(<Merchants {...DATA.merchants}/>, merchants);
	}

	// All Merchants page
	const allMerchants = document.getElementById('all-merchants');
	if (DATA.allMerchants && allMerchants) {
		ReactDOM.render(<AllMerchants {...DATA.allMerchants}/>, allMerchants);
	}

	// Main page
	const partners = document.getElementById('partners');
	if (DATA.partners && partners) {
		ReactDOM.render(<Partners {...DATA.partners}/>, partners);
	}

	// Site Mnogoru Gift
	const mnogoGift = document.getElementById('mnogoru-gift');
	if (mnogoGift) {
		mnogoGift.addEventListener('click', () => {
			toggleClass(mnogoGift, 'active');
		});
	}

	function toggleClass(elem, className) {
		var classString = elem.className;
		var nameIndex = classString.indexOf(className);

		if (nameIndex === -1) {
			classString += ' ' + className;
		} else {
			classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length);
		}

		elem.className = classString;
	}

	const verticalbanners = document.getElementById('verticalbanners');
	if (DATA.verticalbanners && verticalbanners) {
		const Verticalbanners = require('./app/verticalbanners');
		ReactDOM.render(<Verticalbanners {...DATA.verticalbanners}/>, verticalbanners);
	}

	const cardDescription = document.getElementById('card-description');
	if (cardDescription) {
		let CardDescription = require('./app/card-description');
		ReactDOM.render(<CardDescription {...DATA.cardDescription}/>, cardDescription);
	}

	const specialOffers = document.getElementById('special-offers');
	if (specialOffers) {
		let SpecialOffers = require('./app/special-offers');
		ReactDOM.render(<SpecialOffers {...DATA.specialOffers}/>, specialOffers);
	}

	const wrotator = document.getElementById('wrotator');
	if (wrotator && DATA.backgrounds && DATA.backgrounds.data && DATA.backgrounds.data.length) {
		const Wrotator = require('./app/wrotator');
		ReactDOM.render(<Wrotator {...DATA.backgrounds}/>, wrotator);
	}

	const teasers = document.querySelectorAll('.js-teaser .short-product__link');
	if (teasers) {
		Array.prototype.forEach.call(teasers, teaser => {
			teaser.addEventListener('click', () => {
				if (!window.rrApiOnReady) {
					return;
				}

				const id = teaser.dataset.id;
				window.rrApiOnReady.push(function () {
					try {
						window.rrApi.view(id);
					} catch (e) {}
				});
			});
		});
	}

	const mainTeasers = document.getElementById('main-teasers');
	if (mainTeasers) {
		let teasers = document.querySelectorAll('#main-teasers > div');
		teasers = Array.prototype.map.call(teasers, (teaser, index) => {
			return (
				<div
					key={index}
					dangerouslySetInnerHTML={convertNodeToDangerouslyHTML(teaser)}
					/>
			);
		});
		const Slider = require('react-slick');
		const MainTeasers = React.createClass({
			componentDidMount() {
				mainTeasers.style.display = 'block';
			},

			render() {
				const settings = {
					infinite: false,
					draggable: false,
					swipe: false,
					speed: 500,
					slidesToShow: 5,
					slidesToScroll: 5,
					responsive: [
						{
							breakpoint: 991,
							settings: {
								slidesToShow: 4,
								slidesToScroll: 4
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 3
							}
						},
						{
							breakpoint: 608,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 2
							}
						},
						{
							breakpoint: 440,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1
							}
						}
					]
				};

				return (
					<Slider {...settings}>
						{teasers}
					</Slider>
				);
			}
		});

		ReactDOM.render(<MainTeasers/>, mainTeasers);
	}

	const sidebarTeasers = document.getElementById('sidebar-teasers');
	if (sidebarTeasers) {
		let teasers = document.querySelectorAll('#sidebar-teasers > div');
		teasers = Array.prototype.map.call(teasers, (teaser, index) => {
			return (
				<div
					key={index}
					dangerouslySetInnerHTML={convertNodeToDangerouslyHTML(teaser)}
					/>
			);
		});
		const Slider = require('react-slick');
		const SidebarTeasers = React.createClass({
			componentDidMount() {
				sidebarTeasers.style.visibility = 'visible';
			},

			render() {
				const settings = {
					infinite: false,
					draggable: false,
					vertical: true,
					swipe: false,
					speed: 500,
					slidesToShow: 3,
					slidesToScroll: 3,
					responsive: [
						{
							breakpoint: 991,
							settings: {
								vertical: false,
								slidesToShow: 3,
								slidesToScroll: 3
							}
						},
						{
							breakpoint: 608,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 2
							}
						},
						{
							breakpoint: 440,
							settings: {
								slidesToShow: 1,
								slidesToScroll: 1
							}
						}
					]
				};

				return (
					<Slider {...settings}>
						{teasers}
					</Slider>
				);
			}
		});

		ReactDOM.render(<SidebarTeasers/>, sidebarTeasers);
	}
})();
