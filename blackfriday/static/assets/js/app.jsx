/* global window document */

require('css/app.styl');

import React from 'react';
import ReactDOM from 'react-dom';

import Scroll from 'react-scroll';

import Tabs from './app/react-simpletabs.jsx';
import {categoriesSorting, toggleClass} from './app/utils.js';

import SimpleMenu from './app/simple-menu.jsx';
import Header from './app/header.jsx';
import SidebarCats from './app/sidebar-cats.jsx';

import Superbanner from './app/superbanner.jsx';
import Products from './app/products.jsx';
import Banners from './app/banners.jsx';

// Retail Rocket
import {action3} from './app/retailrocket.js';

(function () {
	'use strict';

	// Clone settings
	const DATA = JSON.parse(JSON.stringify(window.DATA));

	// Site Header
	ReactDOM.render(<Header headerMenu={DATA.headerMenu} categories={DATA.categories}/>, document.getElementById('header'));
	// Site Footer menu
	ReactDOM.render(<SimpleMenu list={DATA.footerCats}/>, document.getElementById('footer-cats'));

	// Site Sidebar menu
	const sidebarCats = document.querySelector('.super-header__sidebar-cats');
	if (!window.isSideMenuHidden && sidebarCats) {
		ReactDOM.render(<SidebarCats list={DATA.categories} isSideShown={DATA.isSideShown}/>, sidebarCats);
	}

	// Russian Products page Sidebar menu
	const categoriesRus = document.getElementById('categories-rus');
	if (categoriesRus && DATA.categoriesRus) {
		const sideHiddenBlock = document.getElementById('sidebar-hidden-block');
		if (sideHiddenBlock) {
			sideHiddenBlock.style.display = 'none';
		}
		const m = (
			<div className="categories-rus">
				<div className="categories-rus__title">
					{'Лучшие скидки иностранных интернет магазинов'}
				</div>

				<SimpleMenu
					list={DATA.categoriesRus}
					sorting={categoriesSorting}
					/>
			</div>
		);
		ReactDOM.render(m, categoriesRus);
	}

	// Site Superbanner
	const superbanner = document.getElementById('superbanner');
	if (
		superbanner &&
		DATA.superbanners &&
		(DATA.superbanners.pagesCount || (DATA.superbanners.data && DATA.superbanners.data.length))
	) {
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
					offset={-120}
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
						anchorName="anchor-products"
						onClick={this.handleClick}
						key={'anchor-products'}
						>
						{'Все лучшие товары'}
					</PseudoLink>
				</div>
			);
		}
	});

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
					<Scroll.Element name="anchor-products"/>

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

							<Products {...DATA.products}/>
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
			const categoryId = (DATA.category && DATA.category.id) ? String(DATA.category.id) : 'category_id';
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

						<Products {...DATA.products}/>
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

	// Russian Products page
	// Merchant page
	const products = document.getElementById('products');
	if (DATA.products && products) {
		ReactDOM.render(<Products {...DATA.products}/>, products);
	}

	// Main page
	// Category page
	const merchants = document.getElementById('merchants');
	if (DATA.merchants && merchants) {
		const Merchants = require('./app/merchants').Merchants;
		ReactDOM.render(<Merchants {...DATA.merchants}/>, merchants);
	}

	// All Merchants page
	const allMerchants = document.getElementById('all-merchants');
	if (DATA.allMerchants && allMerchants) {
		const AllMerchants = require('./app/merchants').AllMerchants;
		ReactDOM.render(<AllMerchants {...DATA.allMerchants}/>, allMerchants);
	}

	// Main page
	const partners = document.getElementById('partners');
	if (DATA.partners && partners) {
		const Partners = require('./app/partners');
		ReactDOM.render(<Partners {...DATA.partners}/>, partners);
	}

	// Partners
	const partnerList = document.getElementById('partner-list');
	if (DATA.partners && partnerList) {
		const PartnerList = require('./app/partner-list');
		ReactDOM.render(<PartnerList {...DATA.partners}/>, partnerList);
	}

	// Site Mnogoru Gift
	const mnogoGift = document.getElementById('mnogoru-gift');
	if (mnogoGift) {
		mnogoGift.addEventListener('click', () => {
			toggleClass(mnogoGift, 'active');
		});
	}

	const shareToggler = document.querySelector('.super-header__share-toggler');
	if (shareToggler) {
		const share = document.querySelector('.super-header__share');
		const shareClose = document.querySelector('.super-header__share-close');
		shareToggler.addEventListener('click', e => {
			e.preventDefault();
			toggleClass(share, 'active');
		});
		shareClose.addEventListener('click', e => {
			e.preventDefault();
			toggleClass(share, 'active');
		});
	}

	const verticalbanners = document.getElementById('verticalbanners');
	if (DATA.verticalbanners && verticalbanners) {
		const Verticalbanners = require('./app/verticalbanners');
		ReactDOM.render(<Verticalbanners {...DATA.verticalbanners}/>, verticalbanners);
	}

	const cardDescription = document.getElementById('card-description');
	if (cardDescription && DATA.cardDescription) {
		const CardDescription = require('./app/card-description');
		ReactDOM.render(<CardDescription {...DATA.cardDescription}/>, cardDescription);
	}

	const specialOffers = document.getElementById('special-offers');
	if (specialOffers && DATA.specialOffers) {
		const SpecialOffers = require('./app/special-offers');
		ReactDOM.render(<SpecialOffers {...DATA.specialOffers}/>, specialOffers);
	}

	const wrotator = document.getElementById('wrotator');
	if (wrotator && DATA.backgrounds && DATA.backgrounds.data && DATA.backgrounds.data.length) {
		const Wrotator = require('./app/wrotator');
		ReactDOM.render(<Wrotator {...DATA.backgrounds}/>, wrotator);
	}

	const teasersOnMain = document.getElementById('teasers-on-main');
	if (teasersOnMain && DATA.teasersOnMain && DATA.teasersOnMain.data && DATA.teasersOnMain.data.length) {
		const TeasersOnMain = require('./app/teasers-on-main');
		ReactDOM.render(<TeasersOnMain footer={<MainTeaserFooter/>} {...DATA.teasersOnMain}/>, teasersOnMain);
	}

	const teasers = document.getElementById('sidebar-teasers');
	if (
		window.innerWidth > 991 &&
		teasers &&
		DATA.teasers &&
		DATA.teasers.data &&
		DATA.teasers.data.length
	) {
		const Teasers = require('./app/teasers');
		ReactDOM.render(<Teasers {...DATA.teasers}/>, teasers);
	}

	const categoryName = document.getElementById('category-name');
	if (categoryName && DATA.category && DATA.category.name) {
		categoryName.innerHTML = DATA.category.name;
	}

	if (DATA.category) {
		action3(DATA.category.name);
	}
	if (DATA.cardDescription) {
		action3(DATA.cardDescription.data.name);
	}
})();
