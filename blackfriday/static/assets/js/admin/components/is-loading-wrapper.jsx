import React from 'react';
import b from 'b_';

const className = 'is-loading-wrapper';

const IsLoadingWrapper = props => (
	<div className={b(className, {loading: props.isLoading})}>
		{props.children}

		<div className={b(className, 'indicator')}/>
	</div>
);
IsLoadingWrapper.propTypes = {
	children: React.PropTypes.any,
	isLoading: React.PropTypes.bool
};
IsLoadingWrapper.defaultProps = {
	isLoading: false
};

export default IsLoadingWrapper;
