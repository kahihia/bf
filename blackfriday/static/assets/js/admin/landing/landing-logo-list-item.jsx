/* eslint react/no-find-dom-node: 0 */

import React from 'react';
import {DragSource as dragSource, DropTarget as dropTarget} from 'react-dnd';
import b from 'b_';
import Glyphicon from '../components/glyphicon.jsx';

const logoSource = {
	beginDrag(props) {
		return {
			id: props.id,
			originalIndex: props.findLogo(props.id).index
		};
	},

	endDrag(props, monitor) {
		const {id: droppedId, originalIndex} = monitor.getItem();
		const didDrop = monitor.didDrop();

		if (didDrop) {
			return;
		}

		props.moveLogo(droppedId, originalIndex);
	}
};

const logoTarget = {
	canDrop() {
		return false;
	},

	hover(props, monitor) {
		const {id: draggedId} = monitor.getItem();
		const {id: overId} = props;

		if (draggedId !== overId) {
			const {index: overIndex} = props.findLogo(overId);
			props.moveLogo(draggedId, overIndex);
		}
	}
};

class LandingLogoListItem extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickLandingLogoEdit = this.handleClickLandingLogoEdit.bind(this);
		this.handleClickLandingLogoDelete = this.handleClickLandingLogoDelete.bind(this);
	}

	handleClickLandingLogoEdit(e) {
		e.preventDefault();
		this.props.onClickEdit(this.props.id);
	}

	handleClickLandingLogoDelete(e) {
		e.preventDefault();
		this.props.onClickDelete(this.props.id);
	}

	render() {
		const {image, url, isDragging, connectDragSource, connectDropTarget} = this.props;
		const className = 'landing-logo-list';

		return connectDragSource(connectDropTarget(
			<div className={b(className, 'item', {'is-dragging': isDragging})}>
				<span
					className={b(className, 'link')}
					title={url}
					>
					<img
						className={b(className, 'logo')}
						src={image}
						alt=""
						/>
				</span>

				<span className={b(className, 'actions')}>
					<span
						className="landing-logo-list__action text-info"
						title="Отредактировать"
						onClick={this.handleClickLandingLogoEdit}
						>
						<Glyphicon name="pencil"/>
					</span>

					<span
						className="landing-logo-list__action text-danger"
						title="Удалить"
						onClick={this.handleClickLandingLogoDelete}
						>
						<Glyphicon name="remove"/>
					</span>
				</span>
			</div>
		));
	}
}
LandingLogoListItem.propTypes = {
	id: React.PropTypes.number,
	image: React.PropTypes.string,
	onClickEdit: React.PropTypes.func,
	onClickDelete: React.PropTypes.func,
	url: React.PropTypes.string,
	connectDragSource: React.PropTypes.func.isRequired,
	connectDropTarget: React.PropTypes.func.isRequired,
	isDragging: React.PropTypes.bool.isRequired,
	moveLogo: React.PropTypes.func.isRequired,
	findLogo: React.PropTypes.func.isRequired
};
LandingLogoListItem.defaultProps = {
};

const C = dropTarget('logo', logoTarget, connect => ({
	connectDropTarget: connect.dropTarget()
}))(LandingLogoListItem);

const L = dragSource('logo', logoSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))(C);

export default L;
