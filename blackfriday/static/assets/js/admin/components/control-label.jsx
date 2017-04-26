import React from 'react';
import classNames from 'classnames';

class ControlLabel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {className, name, required} = this.props;

		return (
			<span className={classNames('control-label', className)}>
				{typeof name === 'function' ? name() : name}

				{required ? (
					<span>
						{'*'}
					</span>
				) : null}

				{name ? ':' : ' '}
			</span>
		);
	}
}
ControlLabel.propTypes = {
	className: React.PropTypes.string,
	name: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.node,
		React.PropTypes.func
	]),
	required: React.PropTypes.bool
};
ControlLabel.defaultProps = {
	required: false
};

export default ControlLabel;
