import React from 'react';
import Icon from '../components/icon.jsx';
import VipPlan from './vip-plan.jsx';
import PlanTable from './plan-table.jsx';

const ShopPlanSelect = React.createClass({
	propTypes: {
		plans: React.PropTypes.array,
		activePlan: React.PropTypes.any,
		onChangePlan: React.PropTypes.func
	},

	handleChangePlan(planId) {
		this.props.onChangePlan(planId);
	},

	render() {
		return (
			<div>
				<h2>
					{'Рекламные пакеты '}
					<small>
						<a
							className="download-file"
							href="/static/CMONDAY2016_commercial_offer.pdf"
							download
							>
							<Icon name="file-pdf"/>
							<span className="download-file__name">
								{'Скачать презентацию'}
							</span>
							<span className="download-file__size">
								{'(1,3 MB)'}
							</span>
						</a>
					</small>
				</h2>

				<div className="plan-chooser">
					<div className="plan-chooser__regular">
						<PlanTable
							plans={this.props.plans}
							activePlan={this.props.activePlan}
							onChangePlan={this.handleChangePlan}
							/>
					</div>

					<div className="plan-chooser__vip">
						<VipPlan/>
					</div>
				</div>
			</div>
		);
	}
});

export default ShopPlanSelect;
