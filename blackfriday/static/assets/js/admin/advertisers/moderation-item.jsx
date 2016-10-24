/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import Input from '../components/input.jsx';

export default class ModerationItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			comment: this.props.merchant.moderation.comment
		};

		this.handleCommentChange = this.handleCommentChange.bind(this);
		this.handleApprove = this.handleApprove.bind(this);
		this.handleReject = this.handleReject.bind(this);

		this.isDisabled = this.isDisabled.bind(this);
	}

	isDisabled() {
		return this.props.merchant.moderation.status !== 1;
	}

	handleCommentChange(event) {
		this.setState({
			comment: event.target.value
		});
	}

	handleApprove() {
		this.props.onClickApprove(this.props.merchant.id, this.state.comment);
	}

	handleReject() {
		this.props.onClickReject(this.props.merchant.id, this.state.comment);
	}

	render() {
		const {merchant} = this.props;
		const {comment} = this.state;

		let className = '';
		if (merchant.moderation.status === 2) {
			className = 'success';
		} else if (merchant.moderation.status === 3) {
			className = 'danger';
		}

		const logo = (
			<img
				src={merchant.image ? merchant.image.url : ''}
				alt=""
				style={{maxWidth: 40, maxHeight: 40}}
				/>
		);
		const previewUrl = `/admin/merchants/${merchant.id}/preview/`;

		return (
			<tr className={className}>
				<td>
					{merchant.image ? logo : null}
				</td>
				<td>
					{merchant.name}
				</td>
				<td>
					<Input
						type="text"
						value={comment}
						placeholder="Комментарий (опционально)"
						disabled={this.isDisabled()}
						onChange={this.handleCommentChange}
						/>
				</td>
				<td className="text-right">
					<div>
						<a
							href={previewUrl}
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
							disabled={this.isDisabled()}
							onClick={this.handleApprove}
							>
							Принять
						</button>
						<button
							className="btn btn-danger"
							type="button"
							disabled={this.isDisabled()}
							onClick={this.handleReject}
							>
							Отклонить
						</button>
					</div>
				</td>
			</tr>
		);
	}
}

ModerationItem.propTypes = {
	merchant: React.PropTypes.object,
	onClickApprove: React.PropTypes.func,
	onClickReject: React.PropTypes.func
};
