GtsUtils = {
	id : 0,

	getId : function() {
		return 'gts-jq-' + (ZtUtils.id++);
	},

	getContextPath : function() {
		return _contextPath;
	}
};

$(function() {

	var fnWrapMessage = function(message) {
		return '<li>' + message + '</li>';
	};
	var fnSetCookieMessage = function(message) {
		$.cookie('ajax.page-message', message, {
					path : GtsUtils.getContextPath()
				});
	};
	var fnGetMessages = function(message) {
		var messages = [];
		if (message) {
			if ($.isArray(message)) {
				$.each(message, function(i, v) {
							var m;
							if ($.isArray(v)) {
								m = v.join('<br />');
							} else {
								m = v;
							}
							messages.push(fnWrapMessage(m));
						});
			} else {
				messages.push(fnWrapMessage(message));
			}
		}
		return messages;
	};

	var hideCallId = false;
	var elAjaxMessage = $('#ajax-messages');
	var elAjaxMessageAlert = $('.alert', elAjaxMessage);
	var elAjaxMessageContent = $('.message-content', elAjaxMessage);
	var alertClass = {
		'success' : 'alert-success',
		'error' : 'alert-error',
		'warning' : 'alert-block'
	};

	var fnHide = function() {
		elAjaxMessage.hide();
	};
	var fnSetHide = function(timeout) {
		if (hideCallId) {
			fnClearHide(hideCallId);
		}
		hideCallId = setTimeout(fnHide, timeout);
	};
	var fnClearHide = function() {
		clearTimeout(hideCallId);
		hideCallId = false;
	};
	var fnWrapMessageElements = function(message) {
		if ($.isArray(message)) {
			message = message.join('');
		}
		return '<ul class="unstyled" style="margin-bottom: 0">' + message
				+ '</ul>';
	};
	var fnShowMessageEl = function(message, type, el) {
		$('.message-content', el).html(fnWrapMessageElements(message));
		$.each(alertClass, function(i, v) {
					el.removeClass(v);
				});
		el.addClass(alertClass[type]);
		el.show();

		if ($.fn.effect) {
			el.effect('highlight', {}, 3000);
		}
	};
	var fnShowMessage = function(message, type, el) {
		if (el) {
			fnShowMessageEl(message, type, el);
			return;
		}

		if (hideCallId) {
			fnClearHide(hideCallId);
		}
		elAjaxMessageContent.html(fnWrapMessageElements(message));
		$.each(alertClass, function(i, v) {
					elAjaxMessageAlert.removeClass(v);
				});
		elAjaxMessageAlert.addClass(alertClass[type]);
		elAjaxMessage.show();

		if ($.fn.effect) {
			elAjaxMessageAlert.effect('highlight', {}, 3000);
		}
	};
	var fnAdjustView = function() {
		elAjaxMessage.css('right', ((($(document).width() - $('.container')
						.width()) / 2) + 5)
						+ 'px');
	};
	var fnProcessJsonResponse = function(xhr, $form, opts) {
		opts = opts || {};

		if ($form) {
			$form.valid();
		}

		var resp = undefined;
		var messages = undefined;
		if (xhr.responseText) {
			resp = $.parseJSON(xhr.responseText);
			messages = resp ? fnGetMessages(resp['_page-message']) : [];
		}

		if (resp && resp['_gts-redirect-path']) {
			if ($.isArray(messages) && messages.length > 0) {
				fnSetCookieMessage(messages.join(''));
			}
			var path = resp['_gts-redirect-path'];
			window.location = GtsUtils.getContextPath() + path;
		} else {
			var fieldErrors = resp ? resp['_field-errors'] : undefined;
			if (fieldErrors) {
				var fields = opts['fields'] || {};

				var fieldErrorMessages = {};
				$.each(fieldErrors, function(name) {
							var field;
							if (fields[name]) {
								field = fields[name];
							} else {
								field = name;
							}
							if ($form
									&& $form.validate().elements()
											.is('input[name="' + field + '"]')) {
								var fmsg = fieldErrors[name];
								if ($.isArray(fmsg)) {
									fieldErrorMessages[field] = fmsg
											.join('<br />');
								} else {
									fieldErrorMessages[field] = fmsg;
								}
							} else {
								messages.push(fnWrapMessage(fieldErrors[name]));
							}
						});

				if ($form) {
					var fn = function() {
						$form.validate().showErrors(fieldErrorMessages);
					};
					setTimeout(fn, 500);
				}
			}
			if ($.isArray(messages) && messages.length > 0) {
				var msgtype = resp['_page-message-type'] || opts.type
						|| 'success';
				var msgel = opts.el;
				fnShowMessage(messages, msgtype, msgel);
				if (msgtype == 'success' && !msgel) {
					fnSetHide(5000);
				}
			} else if (opts.hideMessage) {
				fnHide();
				fnClearHide();
			}
		}
	};

	$(window).on('resize', fnAdjustView);
	fnAdjustView();

	if (typeof _error_message != 'undefined' && _error_message) {
		fnShowMessage(_error_message, 'error');
	} else {
		var m = $.cookie('ajax.page-message');
		if (m) {
			fnShowMessage(m, 'success');
			fnSetCookieMessage('');
		}
	}

	$('a.close', elAjaxMessage).on('click', function() {
				fnHide();
				fnClearHide();
			});

	$.extend(GtsUtils, {
		getAjaxifiedFrameData : function(data) {
			return $.extend({}, data, {
						__gtsajaxframe : true
					});
		},

		processAjaxSuccess : function(xhr, $form, opts) {
			try {
				fnProcessJsonResponse(xhr, $form, opts);
			} catch (err) {
				// Ignore
			}
		},

		processAjaxError : function(xhr, $form, opts) {
			try {
				fnProcessJsonResponse(xhr, $form, opts);
			} catch (err) {
				fnShowMessage(
						'Unknown error occured while processing the request!',
						'error');
			}
		},

		processAjaxFrameSuccess : function(responseText, status, xhr, $form) {
			try {
				var resp = typeof responseText == 'string' ? $
						.parseJSON(xhr.responseText) : responseText;
				var messages = '';
				if (resp['_page-message']) {
					messages = $.isArray(resp['_page-message'])
							? resp['_page-message'].join('')
							: resp['_page-message'];
				}
				if (resp.__exception) {
					GtsJQuery.showErrorMsg(messages);
				} else if (resp['gts-ajax-redirect']) {
					messages = '';
					if (resp._json && resp._json['_page-message']) {
						messages = $.isArray(resp._json['_page-message'])
								? resp._json['_page-message'].join('')
								: resp._json['_page-message'];
					}

					if (messages) {
						fnSetCookieMessage(messages);
					}
					var path = resp['gts-ajax-redirect-path'];
					window.location = GtsJQuery.getContextPath() + path;
				} else if (messges) {
					fnShowMessage(messges, resp['_page-message-type']
									|| 'success');
				}
			} catch (e) {

			}

			$.extend(xhr, {
						gts : {
							frameprocessed : true
						}
					});
		},

		processAjaxFrameError : function(xhr, status, error) {
			fnShowMessage(
					'There was an unexpected error while processing the request',
					'error');
		},

		successMsg : function(message, millis) {
			fnShowMessage(message, 'success');
			if (millis > 0) {
				fnSetHide(millis);
			}
		},

		warningMsg : function(message, millis) {
			fnShowMessage(message, 'warning');
			if (millis > 0) {
				fnSetHide(millis);
			}
		},

		errorMsg : function(message, millis) {
			fnShowMessage(message, 'error');
			if (millis > 0) {
				fnSetHide(millis);
			}
		}
	});

	var msgprocessing = {
		error : true,
		success : true,
		hideMessage : true
	};
	var fnGetMsgProcessingOpts = function(options) {
		return $.extend({}, msgprocessing, options.msgprocessing || {});
	};

	elAjaxMessage.ajaxSuccess(function(e, xhr, options) {
				var proc = fnGetMsgProcessingOpts(options);
				if (xhr.responseText && proc.success
						&& options.dataType == 'json') {
					var val = options.validator || {};
					GtsUtils.processAjaxSuccess(xhr, val.form, proc);
				}
			});

	elAjaxMessage.ajaxError(function(e, jqXHR, settings, thrownError) {
		var proc = fnGetMsgProcessingOpts(settings);
		if (proc.error) {
			if (jqXHR.status == 403) {
				fnShowMessage('Unable to access the specified resource.',
						'error');
			} else if (jqXHR.status == 404) {
				fnShowMessage('Unable to find the specified resource.', 'error');
			} else if (jqXHR.responseText) {
				var val = settings.validator || {};
				GtsUtils.processAjaxError(jqXHR, val.form
								? $(val.form)
								: undefined, {
							fields : val.fields
						});
			}
		}
	});

	$.ajaxSetup({
				timeout : 600000,
				dataType : 'json',
				cache : false,
				headers : {
					'Accept' : 'application/json, text/javascript'
				},
				msgprocessing : msgprocessing
			});

});

$(function() {
			if ($.validator) {
				$.validator.setDefaults({
							onkeyup : false,
							errorClass : 'error',
							validClass : 'valid',
							errorPlacement : function(error, element) {
								var $el = $(element);
								var $parent = $el.parent();
								var $error = $(error).addClass($el
										.attr('error-placement') == 'inline'
										? 'help-inline'
										: 'help-block');

								var fn = $el.data('gtsFnErrorPlacement');
								if ($.isFunction(fn)) {
									fn.apply(this, arguments);
								} else if ($el.data('select2')) {
									$error.insertAfter($el
											.siblings('.select2-container'));
								} else {
									$error.insertAfter($el);
								}
							},
							highlight : function(element, errorClass,
									validClass) {
								var ctrlGroup = $(element)
										.parents('.control-group');
								if (!ctrlGroup.hasClass(errorClass)) {
									ctrlGroup.addClass(errorClass)
											.removeClass(validClass);
								}
							},
							unhighlight : function(element, errorClass,
									validClass) {
								$(element).parents('.control-group')
										.removeClass(errorClass)
										.addClass(validClass);

							}

						});

				$.validator.addMethod('gts-value-list', function(value,
								element, param) {
							return !$.isArray(param) || param.length <= 0
									|| this.optional(element)
									|| param.contains(value);
						});

				$.validator.addMethod('all-true', function(value, element,
								param) {
							return true;
						});

			}
		});

jQuery.validator.setDefaults({
			ignore : ''
		});