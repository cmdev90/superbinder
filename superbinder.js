(function (window, $){
    
    var binders = {};
    var extractors = {};
    
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

    defineBinder('text', function (element, data, bind) {
        element.val(deserialize(data, bind));
    });

    defineBinder('option', function (element, data, bind) {
        element.val(deserialize(data, bind));
    });

    defineBinder('radio', function (element, data, bind) {
        if (deserialize(data, bind))
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

    var defineExtractor = SuperBinder.prototype.defineExtractor = function (name, fn){
        if (typeof fn === 'function')
            return extractors[name] = fn;
    };

    defineExtractor('text', function (element, callback){
        return callback((element.val() && element.val().length) > 0 ? element.val() : null);
    });

    defineExtractor('option', function (element, callback){
        if (element.find(":selected").val())  
            return callback(element.find(":selected").val().length > 0 ? element.find(":selected").val() : null);
    });

    defineExtractor('radio', function (element, callback){
        if (element.attr("checked") == true)
            return calllback(element.val());
    });

    defineExtractor('checkbox', function (element, callback) {
        if (element.is( ":checked" ) )
            callback(true);
    });

    SuperBinder.prototype.extract =  function () {
        var elements = $(this.form).find('.binder'),
            data = {};

        $.each(elements, function (){
            var mapTo = $(this).attr('data-map') ? $(this).attr('data-map') : $(this).attr('data-bind');
            var bindType = $(this).attr('type') ? $(this).attr('type').toLowerCase(): null;
            
            if (extractors[bindType]) {
                extractors[bindType]($(this), function (value){
                    if (value) {
                        serialize(data, mapTo, value);
                    }
                    else {
                        console.log("WARN: The extractor function `" + bindType + "` yeild no data for element data-bind/data-map `" + mapTo + '`');
                    }
                });
            } 
            else {
                console.log("WARN: No extractor function defined for type `" + bindType + "`")
            }
        });

        return data;
    };

    function setSubmitAction(context) {
        $(document).on('submit', context.form, function(e){
            e.preventDefault();
            context.url = $(this).attr('action');
            context.method = $(this).attr('method');

            $.ajax({
                url: context.url,
                type: context.method,
                data: context.extract(),
                success: context.success,
                error: context.error
            });
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

    // Helper functions
    //-------------------------------------------
    function deserialize(obj,is, value) {
        if (typeof is == 'string') {
            return deserialize(obj, is.split('.'), value);
        }
        else if (is.length==1 && value!==undefined){
            return obj[is[0]] = value;
        }
        else if (is.length==0) {
            if (typeof obj === 'object' && jQuery.isEmptyObject(obj))
                return null;
            return obj;
        }
        else {
            if (value) {
                obj[is[0]] =  obj[is[0]] ? obj[is[0]] : {};
            }

            return deserialize(obj[is[0]], is.slice(1), value);
        }
    }

    function serialize(obj, is, value) {
        if (!value || !is)
            return; // do not serialize null values.

        if (typeof is == 'string') {
            return serialize(obj, is.split('.'), value);
        }
        else if (is.length==1 && value!==undefined){
            return obj[is[0]] = value;
        }
        else if (is.length==0) {
            if (typeof obj === 'object' && jQuery.isEmptyObject(obj))
                return null;
            return obj;
        }
        else {
            obj[is[0]] =  obj[is[0]] ? obj[is[0]] : {};
            return serialize(obj[is[0]], is.slice(1), value);
        }
    }

    // bind superbinder to the browser context.
    if (window) window.SuperBinder = SuperBinder;

})(window, jQuery);
