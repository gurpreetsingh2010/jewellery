$(function() {
			$.Class('gts.attendance.asca.setup.Main', {}, {
						init : function(el, options) {
							this.el = $(el);
							this.options = $.extend({}, {}, options);

							this.el.validate({
										rules : {
											url : {
												required : true
											},
											user : {
												required : true
											},
											password : {
												required : true
											}
										}
									});

							$('input.setup', this.el).on('click',
									this.proxy('_onSetupClick'));
						},
						_onSetupClick : function(e) {
							e.preventDefault();
							if (this.el.valid()) {
								$.ajax({
											url : GtsUtils.getContextPath()
													+ '/setup',
											type : 'POST',
											data : this.el.serialize()
										});
							}
						}
					});
		});