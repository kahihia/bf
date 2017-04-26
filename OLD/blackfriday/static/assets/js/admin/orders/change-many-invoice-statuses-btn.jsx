import React from 'react';

export default class ChangeManyInvoiceStatusesBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			disabled: props.disabled
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			disabled: nextProps.disabled
		});
	}

	handleClick() {
		this.props.onClick(this.props.invoiceIds);
	}

	render() {
		const {disabled} = this.state;

		return (
			<button
				className="btn btn-default"
				type="button"
				onClick={this.handleClick}
				disabled={disabled}
				>
				{'Применить'}
			</button>
		);
	}
}
ChangeManyInvoiceStatusesBtn.propTypes = {
	invoiceIds: React.PropTypes.array,
	disabled: React.PropTypes.bool,
	newStatus: React.PropTypes.number,
	onClick: React.PropTypes.func.isRequired
};
ChangeManyInvoiceStatusesBtn.defaultProps = {
};
