import React from 'react';
import {isUTM} from '../utils.js';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const UTMWarningIcon = props => {
	if (isUTM(props.value)) {
		return null;
	}

	return (
		<Popover
			className="text-warning utm-warning"
			content="В указанной вами ссылке отсутствует UTM метка (utm_medium, utm_source, utm_campaign)"
			>
			<Glyphicon name="warning-sign"/>
			{' '}
		</Popover>
	);
};
UTMWarningIcon.propTypes = {
	value: React.PropTypes.string.isRequired
};

export default UTMWarningIcon;
