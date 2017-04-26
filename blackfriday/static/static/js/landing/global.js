/**
 * @param {Object} customOptions configuration. Contains next fields:
 * @param {string} customOptions.urlHost host of the server
 * @param {string} customOptions.paramDomain domain for the request
 * @param {Function} customOptions.getYaCounter function to retrieve a Yandex.Metric object
 * @param {jQuery} customOptions.fmRequest jQuery object of request form
 * @param {jQuery} customOptions.fmThanks jQuery object of answer form
 * @param {Function} customOptions.onOpenDialog callback, which is called before form is shown, receive next parameters:
 * @param {string} customOptions.onOpenDialog.title caption of the form
 * @param {string} customOptions.onOpenDialog.button caption of the button
 * @param {string} customOptions.onOpenDialog.description description of the form
 * @version 1.1.1
 * @constructor
 */
var LPCMSApp = function (customOptions) {
    /**
     * @type {{[urlHost]: string, [paramDomain]: null, [getYaCounter]: Function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
     */
    var defaultOptions = {
            getYaCounter: null,
            fmRequest: $('#fmRequest'),
            fmThanks: $('#fmThanks'),
            /**
             * @callback
             * @param {String} title a title of dialog
             * @param {String} button a button text
             * @param {String} [description] a description
             */
            onOpenDialog: function (title, button, description) {
            }
        },
        /**
         * @type {{[urlHost]: string, [paramDomain]: null, [getYaCounter]: Function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
         */
        options = $.extend({}, defaultOptions, customOptions);

    function init() {
        $('[data-type]').each(function (index, item) {
            $(item).fancybox({
                type: 'inline',
                content: $(options.fmRequest),
                padding: 15,
                margin: 15,
                openEffect: 'fade',
                closeEffect: 'fade'
            });
        }).click(function (e) {
            e.preventDefault();

            var $this = $(this);
            var title = $this.data('title');
            var type = $this.data('type');
            var btn = $this.data('btn');
            var yagoal = $this.data('yagoal');
            var optionalNames = [];
            if ($this.data('optional-names')) {
                optionalNames.push($this.data('optional-names'));
            }
            var description = '';

            var fmRequest = options.fmRequest;
            $(fmRequest).find('input').val('');
            $(fmRequest).find('.ignore').removeClass('ignore');
            $(fmRequest).find('input[name=type]').val(type);
            $(fmRequest).find('input[name=yagoal]').val(yagoal);

            for (var i in optionalNames) {
                if (optionalNames.hasOwnProperty(i)) {
                    $(fmRequest).find('input[name=' + optionalNames[i] + ']').addClass('ignore');
                }
            }

            options.onOpenDialog(title, btn, description);

            return false;
        });

        $('form').each(function () {
            $(this).validate({
                submitHandler: function (form) {
                    var $form = $(form);
                    var data = {
                        name: $form.find('[name=name]').val(),
                        email: $form.find('[name=email]').val(),
                        tel: $form.find('[name=phone]').val(),
                        organization: $form.find('[name=organization]').val(),
                        type: $form.find('[name=type]').val(),
                        comment: $form.find('[name=comment]').val(),
                        ok: 'OK'
                    };
                    if (options.paramDomain) {
                        data.domain = options.paramDomain;
                    }
                    $.ajax({
                        async: 'true',
                        type: 'POST',
                        cache: false,
                        url: 'http://mebel-mechta.uz/sendmail.php',
                        data: $.param(data),
                        crossDomain: true,
                        success: function () {
                            $.fancybox.close();
                            if (options.fmThanks) {
                                $.fancybox({
                                    type: 'inline',
                                    content: $(options.fmThanks),
                                    padding: 15,
                                    margin: 15,
                                    openEffect: 'fade',
                                    closeEffect: 'fade'
                                });
                                setTimeout(function () {
                                    $.fancybox.close();
                                }, 3000);
                            }
                        }
                    });
                    try {
                        var yaGoal = $form.find('[name=yagoal]').val();
                        options.getYaCounter && yaGoal && options.getYaCounter().reachGoal && options.getYaCounter().reachGoal(yaGoal);
                    } catch (e) {
                        window.console && window.console.error('Can not send a Yandex Goal', e);
                    }
                    return false;
                },
                ignore: ".ignore",
                errorPlacement: function (error, element) {
                    $(element).append('<div>', $(error).text());
                },
                rules: {
                    'name': 'required',
                    'phone': 'required',
                    'email': {
                        'required': true,
                        'email': true
                    }
                },
                messages: {
                    'name': {
                        'required': 'Пожалуйста, укажите Ваше имя'
                    },
                    'phone': {
                        'required': 'Пожалуйста, укажите Ваш телефонный номер'
                    },
                    'email': {
                        'required': 'Пожалуйста, укажите адрес Вашей электронной почты',
                        'email': 'Пожалуйста, укажите корректный адрес электронной почты'
                    }
                }
            });
        });
    }

    /**
     * @param {Object|Array} inputOrArrayOfInputs
     * @returns {String}
     */
    function retrieveComplexValue(inputOrArrayOfInputs) {
        var tmp = $(inputOrArrayOfInputs);
        if (tmp.length > 1) {
            var complexValue = '';
            tmp.each(function (index, item) {
                complexValue += $(item).val();
            });
            return complexValue;
        } else if (tmp.length > 0) {
            return tmp.val();
        }
        return null;
    }

    init();
};