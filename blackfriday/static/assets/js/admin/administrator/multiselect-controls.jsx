/* global React */
/* eslint "react/require-optimization": "off" */

export default class MultiselectControls extends React.Component {
	render() {
		const gutterSize = 2;

		return (
			<div>
				<div style={{marginBottom: gutterSize}}>
					<button
						className="btn btn-default btn-xs btn-block"
						type="button"
						id={this.props.prefix + '-multiselect-right-all'}
						title="Выбрать все"
						disabled={this.props.disabled}
						>
						<i className="glyphicon glyphicon-forward"/>
					</button>
				</div>
				<div style={{marginBottom: gutterSize}}>
					<button
						className="btn btn-default btn-xs btn-block"
						type="button"
						id={this.props.prefix + '-multiselect-right-selected'}
						title="Выбрать"
						disabled={this.props.disabled}
						>
						<i className="glyphicon glyphicon-triangle-right"/>
					</button>
				</div>
				<div style={{marginBottom: gutterSize}}>
					<button
						className="btn btn-default btn-xs btn-block"
						type="button"
						id={this.props.prefix + '-multiselect-left-selected'}
						title="Убрать"
						disabled={this.props.disabled}
						>
						<i className="glyphicon glyphicon-triangle-left"/>
					</button>
				</div>
				<div>
					<button
						className="btn btn-default btn-xs btn-block"
						type="button"
						id={this.props.prefix + '-multiselect-left-all'}
						title="Убрать все"
						disabled={this.props.disabled}
						>
						<i className="glyphicon glyphicon-backward"/>
					</button>
				</div>
			</div>
		);
	}
}

MultiselectControls.propTypes = {
	prefix: React.PropTypes.string,
	disabled: React.PropTypes.bool
};

MultiselectControls.defaultProps = {
	disabled: false
};
