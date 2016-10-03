/* global document jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import ImagesUploadForm from './images-upload-form.jsx';
import ImageInfo from './image-info.jsx';

class ImagesUpload extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.handleClickModalOpen = this.handleClickModalOpen.bind(this);
	}

	modalOpen() {
		const {exactSize, onUpload, width, height} = this.props;

		jQuery('#images-upload-modal').modal('show');
		const onSubmit = data => {
			jQuery('#images-upload-modal').modal('hide');
			onUpload(data);
		};
		ReactDOM.render(
			<ImagesUploadForm
				{...{
					exactSize,
					onSubmit,
					width,
					height
				}}
				/>
			,
			document.getElementById('images-upload-form')
		);
	}

	handleClickModalOpen() {
		this.modalOpen();
	}

	render() {
		const {
			width,
			height
		} = this.props;

		return (
			<div className="">
				<button
					className="btn btn-default"
					onClick={this.handleClickModalOpen}
					type="button"
					>
					{'Загрузить'}
				</button>

				<ImageInfo
					ext={['png', 'jpg']}
					{...{
						width,
						height
					}}
					/>
			</div>
		);
	}
}
ImagesUpload.propTypes = {
	onUpload: React.PropTypes.func.isRequired,
	width: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	height: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	exactSize: React.PropTypes.bool
};
ImagesUpload.defaultProps = {
};

export default ImagesUpload;
