/* global $ */

var ts = new Date(2016, 10, 24, 0, 0);

if ((new Date()) > ts) {
	// The new year is here! Count towards something else.
	// Notice the *1000 at the end - time must be in milliseconds
	ts = (new Date()).getTime() + (10 * 24 * 60 * 60 * 1000);
}

var $d = $('#countdown-d');
var $h = $('#countdown-h');
var $m = $('#countdown-m');
var $s = $('#countdown-s');

$('#countdown').countdown({
	timestamp: ts,
	callback: function (d, h, m, s) {
		$d.text(declOfNum(d, ['день', 'дня', 'дней']));
		$h.text(declOfNum(h, ['час', 'часа', 'часов']));
		$m.text(declOfNum(m, ['минута', 'минуты', 'минут']));
		$s.text(declOfNum(s, ['секунда', 'секунды', 'секунд']));

		if (d >= 100) {
			$d.css('width', '27%');
			$h.css('width', '16%');
			$m.css('width', '16%');
			$s.css('width', '16%');
		} else {
			$d.css('width', '19%');
			$h.css('width', '19%');
			$m.css('width', '19%');
			$s.css('width', '19%');
		}
	}
});

/* Обратный отсчет */
function declOfNum(number, titles) {
	var cases = [2, 0, 1, 1, 1, 2];

	return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

