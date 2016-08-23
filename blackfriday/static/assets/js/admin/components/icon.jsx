/* global React */
/* eslint "react/require-optimization": "off" */

class Icon extends React.Component {
	render() {
		return <i className={`icon icon_name_${this.props.name}`}/>;
	}
}
Icon.propTypes = {
	name: React.PropTypes.string.isRequired
};

export default Icon;
