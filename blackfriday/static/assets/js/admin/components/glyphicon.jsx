/* global React */

const Glyphicon = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired,
		className: React.PropTypes.string
	},

	render() {
		const {name, className, ...props} = this.props;

		return (
			<span
				className={`glyphicon glyphicon-${name} ${className ? className : ''}`}
				{...props}
				/>
		);
	}
});

export default Glyphicon;
