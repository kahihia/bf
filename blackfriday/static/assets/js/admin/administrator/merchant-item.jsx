import React from 'react';
import {resolveImgPath} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';

const MerchantItem = React.createClass({
	propTypes: {
		data: React.PropTypes.object,
		onClickEdit: React.PropTypes.func,
		isAdmin: React.PropTypes.bool
	},

	handleClickEdit(e) {
		e.preventDefault();
		if (this.props.onClickEdit) {
			this.props.onClickEdit(this.props.data.advertiser_id);
		}
	},

	render() {
		const data = this.props.data;

		return (
			<tr>
				{this.props.isAdmin ? (
					<td>
						<a
							href="#"
							onClick={this.handleClickEdit}
							>
							<Glyphicon name="pencil"/>
						</a>
					</td>
				) : null}
				<td>
					{data.logo ? (
						<img
							src={resolveImgPath(data.logo)}
							alt=""
							style={{maxWidth: 40, maxHeight: 40}}
							/>
					) : null}
				</td>
				<td>
					{data.merchant_name || ''}
				</td>
				<td>
					{data.advertiser_name || ''}
				</td>
			</tr>
		);
	}
});

export default MerchantItem;
