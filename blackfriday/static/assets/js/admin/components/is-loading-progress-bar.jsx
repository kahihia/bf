import React from 'react';

const IsLoadingProgressBar = () => (
	<div className="progress">
		<div
			className="progress-bar progress-bar-striped active"
			style={{width: '100%'}}
			>
			{'Загрузка...'}
		</div>
	</div>
);
// IsLoadingProgressBar.propTypes = {};
// IsLoadingProgressBar.defaultProps = {};

export default IsLoadingProgressBar;
