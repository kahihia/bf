/* global _ */

import React from 'react';
import Price from 'react-price';
import {formatPrice} from '../utils.js';

export default class PreDefinedPromoTable extends React.Component {
	render() {
		let self = this;

		return (
			<table className="table table-striped">
				<thead>
					<tr>
						{self.props.promoList.map(function (promo) {
							return (
								<th className="text-center" key={promo.id}>{promo.name}</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{self.props.optionList.map(function (option) {
						return (
							<tr style={{height: self.props.rowHeight}} key={option.id}>
								{self.props.promoList.map(function (promo) {
									const opt = _.find(promo.items, o => {
										return o.option === option.option;
									});
									let displayValue;

									if (opt.type === 'Boolean') {
										displayValue = opt.value ?
											(<i className="text-success glyphicon glyphicon-ok"/>) :
											'–';
									} else {
										displayValue = opt.value;
									}

									return (
										<td className="text-center" key={promo.id}>
											{displayValue}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr>
						{self.props.promoList.map(function (promo) {
							return (
								<th className="text-center" key={promo.id}>
									<Price cost={formatPrice(promo.price)} currency={'₽'}/>
								</th>
							);
						})}
					</tr>
				</tfoot>
			</table>
		);
	}
}
PreDefinedPromoTable.propTypes = {
	promoList: React.PropTypes.array,
	optionList: React.PropTypes.array,
	rowHeight: React.PropTypes.number
};
