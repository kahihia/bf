/* global toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';
import ImageInfo from './image-info.jsx';
import IsLoadingProgressBar from '../components/is-loading-progress-bar.jsx';

class ImagesUploadForm extends Form {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			fields: {
				image: {
					label: 'Изображение',
					value: '',
					type: 'file',
					accept: 'image/*',
					required: true,
					help: () => {
						const {
							ext,
							width,
							height
						} = this.props;

						return (
							<ImageInfo
								{...{
									ext,
									width,
									height
								}}
								/>
						);
					}
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestUpload() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);

		let url = '/api/images/';
		if (this.props.exactSize) {
			const {width, height} = this.props;
			url += `?exact_width=${width}&exact_height=${height}`;
		}

		xhr({
			url,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 201: {
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(JSON.parse(data));
					}

					break;
				}
				case 400: {
					this.processErrors(JSON.parse(data));
					break;
				}
				default: {
					toastr.danger('Не удалось загрузить изображение');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestUpload();
	}

	render() {
		const {
			isLoading
		} = this.state;
		const disabled = isLoading || !this.validate();

		const form = ref => {
			this.form = ref;
		};

		return (
			<div className="images-upload-form">
				<div className="modal-body">
					<form
						ref={form}
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('image')}
					</form>

					{isLoading ? <IsLoadingProgressBar/> : null}
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						disabled={isLoading}
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={disabled}
						type="button"
						>
						{'Загрузить'}
					</button>
				</div>
			</div>
		);
	}
}
ImagesUploadForm.propTypes = {
	onSubmit: React.PropTypes.func.isRequired,
	width: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	height: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	ext: React.PropTypes.array,
	exactSize: React.PropTypes.bool
};
ImagesUploadForm.defaultProps = {
};

export default ImagesUploadForm;
