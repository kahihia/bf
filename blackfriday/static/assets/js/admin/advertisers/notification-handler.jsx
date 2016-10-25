/* eslint react/require-optimization: 0 */

import React from 'react';

export default class NotificationHandler extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickEnable = this.handleClickEnable.bind(this);
		this.handleClickDisable = this.handleClickDisable.bind(this);
	}

	handleClickEnable() {
		this.props.onEnable();
	}

	handleClickDisable() {
		this.props.onDisable();
	}

	render() {
		return (
			<span className="notification-handler">
				<span>{this.props.label}</span>
				<button
					type="button"
					className="btn btn-success"
					style={{margin: '0 10px'}}
					onClick={this.handleClickEnable}
					>
					{'Всем'}
				</button>

				<button
					type="button"
					className="btn btn-danger"
					onClick={this.handleClickDisable}
					>
					{'Никому'}
				</button>
			</span>
		);
	}
}
NotificationHandler.propTypes = {
	onEnable: React.PropTypes.func,
	onDisable: React.PropTypes.func,
	label: React.PropTypes.string
};
NotificationHandler.defaultProps = {
	label: 'Почтовые уведомления'
};
