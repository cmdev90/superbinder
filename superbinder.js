(function (window, $){
	var SuperBinder = function (formId){
		this.form = formId;

		this.success = function (response){
			console.log(response);
		};

		this.error = function (error){
			console.log(error);
		};

		setSubmitAction(this);
	};

	SuperBinder.prototype.bind = function (data) {
		var binders = $(this.form).find('.binder');

		$.each(binders, function(){
			var bindWith = $(this).attr('data-bind'),
				bindType = $(this).attr('type') ? $(this).attr('type').toLowerCase(): null;

			if (bindWith) {
				switch (bindType) {
					case 'text':
						$(this).val(index(data, bindWith));
						break;
					case 'option':
						$(this).val(index(data, bindWith));
						break;
					case 'radio':
						if ($(this).val() === index(data, bindWith))
							$(this).attr("checked", true);
						break;
					default:
						$(this).val(index(data, bindWith));
						break;
				};
			}
		});
	};

	SuperBinder.prototype.setSuccess = function (fn) {
		if (typeof fn === 'function')
			this.success = fn;
	};

	SuperBinder.prototype.setError = function (fn) {
		if (typeof fn === 'function')
			this.error = fn;
	};

	function setSubmitAction(context) {
		$(document).on('submit', context.form, function(e){
			e.preventDefault();

			context.url = $(this).attr('action');
			context.method = $(this).attr('method');

			var data = {},
				binders = $(this).find('.binder');

			$.each(binders, function (){
				var bindType = $(this).attr('type') ? $(this).attr('type').toLowerCase(): null;

				switch(bindType){
					case 'text':
						index(data, $(this).attr('data-bind'), $(this).val().length > 0 ? $(this).val() : null);
						break;
					case 'option':
						index(data, $(this).attr('data-bind'), $(this).find(":selected").val().length > 0 ? $(this).find(":selected").val() : null);
						break;
					case 'radio':
						if($(this).attr("checked") == true)
							index(data, $(this).attr('data-bind'), $(this).val());
						break;
					default:
						index(data, $(this).attr('data-bind'), $(this).val());
						break;
				};
			});

			$.ajax({
				url: context.url,
				type: context.method,
				data: {data: JSON.stringify(data)},
				success: context.success,
				error: context.error
			});
		});
	};

	// Helper functions
	//-------------------------------------------
	function index(obj,is, value) {
		if (typeof is == 'string') {
			return index(obj, is.split('.'), value);
		}
		else if (is.length==1 && value!==undefined){
			return obj[is[0]] = value;
		}
		else if (is.length==0) {
			return jQuery.isEmptyObject(obj) ? null : obj;
		}
		else {
			obj[is[0]] =  obj[is[0]] ? obj[is[0]] : {};
			return index(obj[is[0]], is.slice(1), value);
		}
	}

	// bind superbinder to the browser context.
	if (window) window.SuperBinder = SuperBinder;

})(window, jQuery);