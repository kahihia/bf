/* global _ */

import React from 'react';
import Glyphicon from '../components/glyphicon.jsx';

class EditableCell extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isActive: false,
			values: _.cloneDeep(props.values)
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({values: _.cloneDeep(newProps.values)});
	}

	handleClick(e) {
		e.preventDefault();
		this.setState({isActive: !this.state.isActive});
	}

	handleChange(e) {
		const input = e.target;
		this.getStateValueByName(input.name).value = input.value;
		this.forceUpdate();
	}

	handleSave() {
		this.setState({isActive: false}, () => {
			this.props.onChange(this.state.values);
		});
	}

	handleCancel() {
		this.setState({
			isActive: false,
			values: _.cloneDeep(this.props.values)
		});
	}

	handleKeyUp(e) {
		if (e.key === 'Escape') {
			this.handleCancel();
		} else if (e.key === 'Enter') {
			this.handleSave();
		}
	}

	getStateValueByName(name) {
		return _.find(this.state.values, {name});
	}

	render() {
		const {isActive} = this.state;
		const {
			children,
			values
		} = this.props;

		return (
			<div className="editable-cell">
				{children}

				<span
					className="editable-cell__btn"
					onClick={this.handleClick}
					title="Отредактировать"
					>
					<Glyphicon name="pencil"/>
				</span>

				{isActive ? (
					<div className="popover top">
						<div className="arrow"/>

						<div className="popover-content">
							{values.map(item => {
								return (
									<p key={item.name}>
										{item.type === 'textarea' ? (
											<textarea
												value={this.getStateValueByName(item.name).value}
												className="form-control"
												name={item.name}
												onChange={this.handleChange}
												rows="6"
												/>
										) : (
											<input
												value={this.getStateValueByName(item.name).value}
												className="form-control"
												type={item.type || 'text'}
												name={item.name}
												onChange={this.handleChange}
												onKeyUp={this.handleKeyUp}
												/>
										)}
									</p>
								);
							})}

							<p className="text-right">
								<button
									className="btn btn-danger"
									type="button"
									onClick={this.handleCancel}
									>
									{'Отмена'}
								</button>

								<button
									className="btn btn-success"
									type="button"
									onClick={this.handleSave}
									>
									{'Сохранить'}
								</button>
							</p>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
EditableCell.propTypes = {
	children: React.PropTypes.node,
	values: React.PropTypes.array,
	onChange: React.PropTypes.func
};
EditableCell.defaultProps = {
};

export default EditableCell;
