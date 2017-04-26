import React from 'react';

class Checkbox extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange() {
		this.props.onChange(!this.props.isChecked);
	}

	render() {
		const {
			disabled,
			isChecked,
			name,
			text
		} = this.props;

		return (
			<div className="checkbox">
				<label>
					<input
						type="checkbox"
						onChange={this.handleChange}
						checked={Boolean(isChecked)}
						{...{
							disabled,
							name
						}}
						/>

					{text}
				</label>
			</div>
		);
	}
}
Checkbox.propTypes = {
	name: React.PropTypes.string,
	text: React.PropTypes.string.isRequired,
	disabled: React.PropTypes.bool,
	isChecked: React.PropTypes.bool,
	onChange: React.PropTypes.func.isRequired
};
Checkbox.defaultProps = {
	isChecked: false
};

export default Checkbox;
