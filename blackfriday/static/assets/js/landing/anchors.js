/* global $ */

// Anchors
$('a[href^="#anchor-"]').on('click', function (e) {
	var $this = $(this);
	var $target = $(this.hash);
	$target = $target.length ? $target : $('[name=' + this.hash.slice(1) + ']');

	if ($target.length) {
		var offset = parseInt($this.data('offset'), 10) || 0;
		var duration = parseInt($this.data('duration'), 10) || 250;

		$('html, body').animate({
			scrollTop: $target.offset().top - offset
		}, duration);

		e.preventDefault();
	}
});
