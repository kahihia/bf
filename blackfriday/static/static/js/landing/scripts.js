$(document).ready(function(){
	$(".fancy, .fancybox").fancybox();

	// Anchors
	$('a[href^=#anchor-]').on('click', function (e) {
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



  // Floctory
  // Добавляет блок с информацией для работы с Floctory
  // Если информация неполная или отсутствует, то блок уничтожается
  var CreateFloctory = function () {
    this.name = null;
    this.email = null;
    this._$block = null;

    // if (this._load()) this._build();
  }

  CreateFloctory.prototype = {
    update: function (name, email) {
      if (!this._save(name, email)) return;
      this._build();
    },

    _build: function () {
      this._$block = $('<div class="i-flocktory" data-fl-user-name="' + this.name + '" data-fl-user-email="' + this.email + '"></div>').appendTo('body');
    },

    _save: function (name, email) {
      this._reset();
      if (!name || !email) return false;
      name = String(name).trim();
      email = String(email).trim();
      this.name = name;
      this.email = email;
      localStorage.setItem('userdata', JSON.stringify({ name: name, email: email }));
      return true;
    },

    _load: function () {
      var data = localStorage.getItem('userdata');
      if (!data) return false;
      data = JSON.parse(data);
      this.name = data.name;
      this.email = data.email;
      return true;
    },

    _reset: function () {
      if (this._$block) this._$block.remove();
      this._$block = null;
      this.name = null;
      this.email = null;
    }
  }

  var createFloctory = new CreateFloctory();



	function showSuccessMessage(text, onClose) {
		var $popup = $('#popup-success');
		var $text = $popup.find('.js-text');
		$text.text(text);
		$.fancybox({
			href: "#popup-success",
			beforeClose: function () {
				onClose();
			}
		});
	}
	function createValidMessage($form) {
		var $btn = $form.find('[type="submit"]');
		var $message = $('<div class="error-valid" />');
		$btn.after($message);
		return $message;
	}
	function formValidMessage($form, text) {
		if (!$form.data('valid-message')) {
			$form.data('valid-message', createValidMessage($form));
		}
		$form.data('valid-message').text(text);
	}
	$('form').on('submit', function (e) {
		e.preventDefault();
		var $this = $(this);

		$.ajax({
			url: $this.prop('action'),
			method: $this.prop('method'),
			data: $this.serialize(),
			success: function (data) {
				console.log(data);
				if (data) {
					if (typeof data === 'string') {
						showSuccessMessage(data, function () {
							formValidMessage($this, '');
						});

            // Floctory
            // Обновляет информацию блока для Floctory
            var name = null;
            var email = null;
            $.each($this.serializeArray(), function (i, e) {
              if (e.name === 'name') name = e.value;
              if (e.name === 'email') email = e.value;
            });
            createFloctory.update(name, email);

					} else if (typeof data.responseText === 'string') {
						formValidMessage($this, data.responseText);
					}
				}
			},
			error: function (data) {
				console.log(data);
				if (data) {
					if (typeof data === 'string') {
						formValidMessage($this, data);
					} else if (typeof data.responseText === 'string') {
						formValidMessage($this, data.responseText);
					}
				}
			}
		});
	});

  /* Обратный отсчет */
  function declOfNum(number, titles) {
    var cases = [2, 0, 1, 1, 1, 2];
    return titles[(number%100>4 && number%100<20) ? 2 : cases[(number%10<5) ? number%10 : 5]];
  }

  var ts = new Date(2017, 0, 25, 0, 0);

  if((new Date()) > ts){
    // The new year is here! Count towards something else.
    // Notice the *1000 at the end - time must be in milliseconds
    ts = (new Date()).getTime() + 10*24*60*60*1000;
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
        $d.css('width', '28%');
        $h.css('width', '20%');
        $m.css('width', '20%');
        $s.css('width', '20%');
      } else {
        $d.css('width', '22%');
        $h.css('width', '22%');
        $m.css('width', '22%');
        $s.css('width', '22%');
      }
    }
  });

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

  $('.mnogoru-gift').on('click', function () {
    $(this).toggleClass('active');
  });
});
