import React from 'react';
import xhr from 'xhr';
import ModerateItem from './moderate-item.jsx';

export class ModerateList extends React.Component {
	constructor() {
		super();
		this.state = {
			data: [],
			isLoading: true
		};
	}

	componentDidMount() {
		xhr.get('/admin/moderate', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({
					data: data
				});
			}
			this.setState({
				isLoading: false
			});
		});
	}

	render() {
		let listStatus = null;

		if (!this.state.data.length) {
			if (this.state.isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Список на модерацию пуст';
			}
		}

		const statusRow = (
			<tr><td colSpan="3" className="text-center text-muted">{listStatus}</td></tr>
		);

		return (
			<div>
				<table className="table table-striped">
					<tbody>
						{this.state.data.map(moderateItem => {
							return (
								<ModerateItem data={moderateItem} key={moderateItem.merchant_id}/>
							);
						})}

						{listStatus ? statusRow : null}
					</tbody>
				</table>
			</div>
		);
	}
}
