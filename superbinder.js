(function (window, $){
	
    var binders = {};
    var mappers = {};
    
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

    var defineBinder = SuperBinder.prototype.defineBinder = function (bindType, fn){
        if (typeof fn === 'function')
            return binders[bindType] = fn;
    };

    var defineMapper = SuperBinder.prototype.defineMapper = function (mapType, fn){
        if (typeof fn === 'function')
            return mappers[mapType] = fn;
    };

    defineBinder('text', function (element, data, bind) {
        element.val(index(data, bind));
    });

    defineBinder('option', function (element, data, bind) {
        element.val(index(data, bind));
    });

    defineBinder('radio', function (element, data, bind) {
        if (index(data, bind))
            return element.attr('checked', true);
    });

	SuperBinder.prototype.bind = function (data) {
		var elements = $(this.form).find('.binder');

		$.each(elements, function(){
			var bind = $(this).attr('data-bind'),
				type = $(this).attr('type') ? $(this).attr('type').toLowerCase(): null;

			if (!bind){
                console.log('WARN: The data-bind attribute was not defined for an element of the class `bind`.');
            }   
            else if (!binders[type] && typeof(binders[type]) !== 'function') {
                console.log('WARN: A sutiable binder was not found for the type `' + type + '`');
            }
            else {
                binders[type]($(this), data, bind);
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
