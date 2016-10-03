/* eslint react/require-optimization: 0 */

import React from 'react';
import {DropTarget as dropTarget, DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import LandingLogoListItem from './landing-logo-list-item.jsx';

const logoTarget = {
	drop(props) {
		props.onDrop();
	}
};

class LandingLogoList extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickLandingLogoEdit = this.handleClickLandingLogoEdit.bind(this);
		this.handleClickLandingLogoDelete = this.handleClickLandingLogoDelete.bind(this);
	}

	handleClickLandingLogoEdit(id) {
		this.props.onClickEdit(id);
	}

	handleClickLandingLogoDelete(id) {
		this.props.onClickDelete(id);
	}

	render() {
		const {logos, connectDropTarget, moveLogo, findLogo} = this.props;

		return connectDropTarget(
			<div className="landing-logo-list">
				{logos.map(item => {
					return (
						<LandingLogoListItem
							key={item.id}
							moveLogo={moveLogo}
							findLogo={findLogo}
							onClickEdit={this.handleClickLandingLogoEdit}
							onClickDelete={this.handleClickLandingLogoDelete}
							{...item}
							/>
					);
				})}
			</div>
		);
	}
}
LandingLogoList.propTypes = {
	connectDropTarget: React.PropTypes.func,
	logos: React.PropTypes.array,
	moveLogo: React.PropTypes.func,
	findLogo: React.PropTypes.func,
	onClickEdit: React.PropTypes.func,
	onClickDelete: React.PropTypes.func,
	onDrop: React.PropTypes.func
};
LandingLogoList.defaultProps = {
};

const Lllt = dropTarget('logo', logoTarget, connect => ({
	connectDropTarget: connect.dropTarget()
}))(LandingLogoList);
const Lllc = dragDropContext(HTML5Backend)(Lllt);

export default Lllc;
