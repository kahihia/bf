import React from 'react';
import Glyphicon from '../components/glyphicon.jsx';

const MerchantEditHeader = props => (
	<div className="page-header">
		<h1>
			{props.name}

			{props.url ? (
				<small>
					{' '}

					<a
						href={props.url}
						target="_blank"
						rel="noopener noreferrer"
						>
						<Glyphicon name="link"/>

						{'URL'}
					</a>
				</small>
			) : null}
		</h1>
	</div>
);
MerchantEditHeader.propTypes = {
	name: React.PropTypes.string,
	url: React.PropTypes.string
};
// MerchantEditHeader.defaultProps = {};

export default MerchantEditHeader;
