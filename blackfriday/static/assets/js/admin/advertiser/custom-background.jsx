/* global React, _, toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import xhr from 'xhr';

import {resolveImgPath} from '../utils.js';
import Select from '../components/select.jsx';
import {getLimit} from './limits.js';
import getCategories from './categories.js';

const CustomBackground = React.createClass({
	propTypes: {
		merchantId: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		])
	},

	getInitialState() {
		return {
			backgrounds: [],
			allowedCategories: []
		};
	},

	componentWillMount() {
		this.requestCategories();
		this.requestBanners();
	},

	requestCategories() {
		getCategories(allowedCategories => {
			this.setState({
				allowedCategories: allowedCategories.map(category => {
					return {
						name: category.name,
						id: category.id
					};
				})
			});
		});
	},

	requestBanners() {
		xhr({
			url: `/admin/merchant/${this.props.merchantId}/backgrounds`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({backgrounds: data});
				}
			} else {
				toastr.error('Не удалось получить список фонов');
			}
		});
	},

	render() {
		let limitMain = getLimit('main_background');
		const bgsMain = [];
		this.state.backgrounds.forEach(bg => {
			if (!bg.on_main) {
				return null;
			}

			limitMain -= 1;

			bgsMain.push(
				<CustomBackgroundTable
					key={bg.id}
					id={bg.id}
					type="on_main"
					value="true"
					left={bg.left}
					right={bg.right}
					/>
			);
		});
		while (limitMain-- > 0) {
			bgsMain.push(
				<CustomBackgroundTable
					key={`on_main_new_${limitMain}`}
					type="on_main"
					value="true"
					/>
			);
		}

		let limitCat = getLimit('cat_background');
		const bgsCat = [];
		this.state.backgrounds.forEach(bg => {
			if (bg.on_main) {
				return null;
			}

			limitCat -= 1;

			bgsCat.push(
				<CustomBackgroundTable
					key={bg.id}
					id={bg.id}
					type="cat_id"
					value={bg.cat_id}
					left={bg.left}
					right={bg.right}
					allowedCategories={this.state.allowedCategories}
					/>
			);
		});
		while (limitCat-- > 0) {
			bgsCat.push(
				<CustomBackgroundTable
					key={`cat_id_new_${limitCat}`}
					type="cat_id"
					allowedCategories={this.state.allowedCategories}
					/>
			);
		}

		return (
			<div className="">
				<h2>
					Брендирование фона
				</h2>

				{bgsMain}
				{bgsCat}
			</div>
		);
	}
});

export default CustomBackground;

const CustomBackgroundTable = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		type: React.PropTypes.string,
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
			React.PropTypes.bool
		]),
		left: React.PropTypes.string,
		right: React.PropTypes.string,
		allowedCategories: React.PropTypes.array
	},

	getDefaultProps() {
		return {
			id: null
		};
	},

	getInitialState() {
		return {
			categoryId: null
		};
	},

	componentWillReceiveProps(newProps) {
		// Select first category
		const {allowedCategories} = newProps;
		if (allowedCategories) {
			const firstCategory = allowedCategories[0];
			if (firstCategory) {
				this.setState({categoryId: firstCategory.id});
			}
		}
	},

	handleChangeCategory(value) {
		this.setState({categoryId: value});
	},

	render() {
		const {id, type, value, left, right, allowedCategories} = this.props;

		let title;
		if (type === 'on_main') {
			title = 'Главная страница';
		} else {
			const category = _.find(allowedCategories, {id: value});
			const categoryName = category ? ` "${category.name}"` : '';
			title = `Категория${categoryName}`;
		}

		const isNewCat = (id === null && type !== 'on_main');

		return (
			<div
				className=""
				data-name={type === 'on_main' ? type : 'at_cat'}
				>
				<h3>
					{title}
					{isNewCat ? (
						<Select
							options={allowedCategories}
							selected={this.state.categoryId}
							onChange={this.handleChangeCategory}
							style={{
								display: 'inline-block',
								marginLeft: 10,
								width: 'auto'
							}}
							/>
					) : null}
				</h3>

				<table className="table">
					<thead>
						<tr>
							<th>
								Левая сторона
							</th>
							<th>
								Правая сторона
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<p>
									<UploadButton
										id={id}
										position="left"
										type={type}
										value={isNewCat ? this.state.categoryId : value}
										isNew={!left}
										/>
									<UploadFormatInfo/>
								</p>
							</td>
							<td>
								<p>
									<UploadButton
										id={id}
										position="right"
										type={type}
										value={isNewCat ? this.state.categoryId : value}
										isNew={!right}
										/>
									<UploadFormatInfo/>
								</p>
							</td>
						</tr>
						<tr>
							<td>
								{left ? (
									<BackgroundImg src={left}/>
								) : null}
							</td>
							<td>
								{right ? (
									<BackgroundImg src={right}/>
								) : null}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
});

const BackgroundImg = props => (
	<img
		src={resolveImgPath(props.src)}
		alt=""
		style={{
			maxHeight: 400,
			width: 'auto'
		}}
		/>
);
BackgroundImg.propTypes = {
	src: React.PropTypes.string
};

const UploadButton = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		position: React.PropTypes.string,
		type: React.PropTypes.string,
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number,
			React.PropTypes.bool
		]),
		isNew: React.PropTypes.bool
	},

	render() {
		const {id, type, value, position, isNew} = this.props;

		return (
			<button
				type="button"
				className={`btn btn-${isNew ? 'success' : 'default'}`}
				data-toggle="modal"
				data-target="#backgroundModal"
				data-id={id}
				data-position={position}
				data-type={type}
				data-type-value={value}
				>
				{isNew ? 'Загрузить' : 'Изменить'}
			</button>
		);
	}
});

const UploadFormatInfo = () => {
	return (
		<span
			className="text-muted"
			style={{
				display: 'inline-block',
				verticalAlign: 'middle'
			}}
			>
			<span className="image-info">
				<span className="image-info__value">
					{'500x2000px '}
				</span>
				<span className="image-info__ext">
					(.png, .jpg)
				</span>
			</span>
		</span>
	);
};
