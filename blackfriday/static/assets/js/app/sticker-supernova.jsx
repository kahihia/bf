import React from 'react';

const className = 'sticker-supernova';

const StickerSupernova = props => (
	<span className={`${className} ${className}_${props.size}`}/>
);
StickerSupernova.propTypes = {
	size: React.PropTypes.oneOf([
		'sm',
		'lg'
	])
};
StickerSupernova.defaultProps = {
	size: 'sm'
};

export default StickerSupernova;
