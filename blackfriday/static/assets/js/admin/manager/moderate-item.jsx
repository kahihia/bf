/* global React, toastr */
/* eslint camelcase: ["error", {properties: "never"}] */
import xhr from 'xhr';

import {resolveImgPath} from '../utils.js';

export default class MerchantItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			disabled: false,
			comment: ''
		};

		this.handleCommentChange = this.handleCommentChange.bind(this);
		this.handleApprove = this.handleApprove.bind(this);
		this.handleReject = this.handleReject.bind(this);
	}

	handleCommentChange(event) {
		this.setState({
			comment: event.target.value
		});
	}

	handleApprove() {
		const data = [{
			merchant_id: this.state.data.merchant_id,
			moderation_status: 'approved'
		}];

		this.setState({
			disabled: true
		}, () => {
			xhr.put('/admin/moderate', {json: data}, (err, resp) => {
				if (!err && (resp.statusCode === 200)) {
					this.requestMerchantGenerate();
					this.setState({
						data: Object.assign({}, this.state.data, {moderation_status: 'approved'})
					}, () => {
						toastr.success('Магазин принят.');
					});
				} else {
					toastr.error('Не удалось изменить статус модерации.');
				}
				this.setState({
					disabled: false
				});
			});
		});
	}

	requestMerchantGenerate() {
		xhr(`/admin/merchant/generate/?id=${this.state.data.merchant_id}`, (err, resp) => {
			if (!err && (resp.statusCode === 200)) {
				console.log('Страница магазина успешно сгенерирована');
			}
		});
	}

	handleReject() {
		const data = [{
			merchant_id: this.state.data.merchant_id,
			moderation_status: 'rejected',
			moderation_comment: this.state.comment
		}];

		this.setState({
			disabled: true
		}, () => {
			xhr.put('/admin/moderate', {json: data}, (err, resp) => {
				if (!err && (resp.statusCode === 200)) {
					this.setState({
						data: Object.assign({}, this.state.data, {moderation_status: 'rejected'})
					}, () => {
						toastr.success('Магазин отклонён.');
					});
				} else {
					toastr.error('Не удалось изменить статус модерации.');
				}
				this.setState({
					disabled: false
				});
			});
		});
	}

	render() {
		const logo = (
			<img
				src={resolveImgPath(this.state.data.merchant_logo)}
				alt=""
				style={{maxWidth: 40, maxHeight: 40}}
				/>
		);

		return (
			<tr>
				<td>
					{this.state.data.moderation_status === 'approved' ? (
						<span className="glyphicon glyphicon-ok text-success"/>
					) : null}
					{this.state.data.moderation_status === 'rejected' ? (
						<span className="glyphicon glyphicon-remove text-danger"/>
					) : null}
				</td>
				<td>
					{this.state.data.merchant_logo ? logo : null}
				</td>
				<td>
					{this.state.data.merchant_name || ''}
				</td>
				<td>
					{this.state.data.moderation_status === 'waiting' ? (
						<input
							type="text"
							className="form-control"
							placeholder="Комментарий (опционально)"
							onChange={this.handleCommentChange}
							/>
					) : null}
				</td>
				<td className="text-right">
					{this.state.data.moderation_status === 'waiting' ? (
						<div>
							<a
								href={`/admin/merchant/${this.state.data.merchant_id}/preview`}
								style={{marginRight: 10}}
								target="_blank"
								rel="noopener noreferrer"
								>
								Предпросмотр
							</a>
							<button
								className="btn btn-success"
								type="button"
								style={{marginRight: 10}}
								disabled={this.state.disabled}
								onClick={this.handleApprove}
								>
								Принять
							</button>
							<button
								className="btn btn-danger"
								type="button"
								disabled={this.state.disabled}
								onClick={this.handleReject}
								>
								Отклонить
							</button>
						</div>
					) : null}
				</td>
			</tr>
		);
	}
}

MerchantItem.propTypes = {
	data: React.PropTypes.object
};
