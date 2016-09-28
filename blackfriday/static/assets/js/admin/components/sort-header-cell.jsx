/* eslint react/require-optimization: 0 */

import React from 'react';
import {SORT_TYPES} from '../const.js';
import {reverseSortDirection} from '../utils.js';

class SortHeaderCell extends React.Component {
	constructor(props) {
		super(props);
		this.handleSortChange = this.handleSortChange.bind(this);
	}

	handleSortChange() {
		const {columnKey, onSortChange, sortDir} = this.props;
		const newSortDir = reverseSortDirection(sortDir);
		onSortChange(columnKey, newSortDir);
	}

	render() {
		const {children, sortDir} = this.props;
		return (
			<span onClick={this.handleSortChange}>
				{children} {sortDir === SORT_TYPES.DESC ? '↓' : '↑'}
			</span>
		);
	}
}
SortHeaderCell.propTypes = {
	columnKey: React.PropTypes.string.isRequired,
	sortDir: React.PropTypes.string,
	onSortChange: React.PropTypes.func.isRequired,
	children: React.PropTypes.node.isRequired
};
SortHeaderCell.defaultProps = {
	sortDir: SORT_TYPES.DESC
};

export default SortHeaderCell;
