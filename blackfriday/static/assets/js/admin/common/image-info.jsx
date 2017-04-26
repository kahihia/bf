import React from 'react';
import b from 'b_';

const className = 'image-info';

const ImageInfo = props => {
	const {label, width, height, ext} = props;

	return (
		<span className={className}>
			{renderLabel(label)}
			{renderValue(width, height)}
			{renderExt(ext)}
		</span>
	);
};
ImageInfo.propTypes = {
	label: React.PropTypes.string,
	width: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	height: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	ext: React.PropTypes.array
};
ImageInfo.defaultProps = {
};

export default ImageInfo;

function renderLabel(label) {
	if (!label) {
		return null;
	}

	return (
		<span className={b(className, 'label')}>
			{`${label}: `}
		</span>
	);
}

function renderValue(width, height) {
	return (
		<span className={b(className, 'value')}>
			{`${width}x${height}px`}
		</span>
	);
}

function renderExt(ext) {
	if (!ext) {
		return null;
	}

	const exts = ext.map(item => (`.${item}`)).join(', ');

	return (
		<span className={b(className, 'ext')}>
			{` (${exts})`}
		</span>
	);
}
