import React from 'react';
import Icon from '../components/icon.jsx';

const DownloadFile = props => (
	<small>
		<a
			className="download-file"
			href={props.href}
			target="_blank"
			rel="noopener noreferrer"
			>
			{props.icon ? (
				<Icon name={props.icon}/>
			) : null}

			<span className="download-file__name">
				{props.name}
			</span>

			{props.size ? (
				<span className="download-file__size">
					{`(${props.size})`}
				</span>
			) : null}
		</a>
	</small>
);
DownloadFile.propTypes = {
	href: React.PropTypes.string.isRequired,
	icon: React.PropTypes.string,
	name: React.PropTypes.string.isRequired,
	size: React.PropTypes.string
};
// DownloadFile.defaultProps = {};

export default DownloadFile;
