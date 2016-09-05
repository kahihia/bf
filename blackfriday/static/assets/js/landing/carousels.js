/* global $ */

// Включаем карусель партнеров когда их больше 1 страницы
if ($('.bxslider-one > div').length > 1) {
	$('.bxslider-one').bxSlider({
		minSlides: 1,
		maxSlides: 1,
		auto: true
	});
}

$('.bxslider-multi').bxSlider({
	slideWidth: 182,
	minSlides: 6,
	maxSlides: 6,
	moveSlides: 1,
	auto: true,
	pager: false
});

$('.js-about-section__carousel').bxSlider({
	minSlides: 1,
	maxSlides: 1,
	auto: true,
	pager: false
});
