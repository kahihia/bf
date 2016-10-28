/* global document, window */
/* eslint camelcase: 0 */

export default function trackAdmitAd() {
	(function (d, w) {
		w._admitadPixel = {
			response_type: 'img',
			action_code: '1',
			campaign_code: 'b8292b105e'
		};
		w._admitadPositions = w._admitadPositions || [];
		w._admitadPositions.push({
			uid: '',
			order_id: '',
			client_id: '',
			tariff_code: '1',
			payment_type: 'lead'
		});
		var id = '_admitad-pixel';
		if (d.getElementById(id)) {
			return;
		}
		var s = d.createElement('script');
		s.id = id;
		var r = (new Date()).getTime();
		var protocol = (d.location.protocol === 'https:' ? 'https:' : 'http:');
		s.src = protocol + '//cdn.asbmit.com/static/js/pixel.min.js?r=' + r;
		d.head.appendChild(s);
	})(document, window);
}
