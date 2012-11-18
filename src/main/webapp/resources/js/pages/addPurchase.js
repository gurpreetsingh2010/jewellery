$(function() {
	$.Class('defysope.addpurchase.Main', {}, {
		init : function(el, options) {
			this.el = $(el);
			$.extend(this.options, options);
			$('select').select2();

		}

	});
});