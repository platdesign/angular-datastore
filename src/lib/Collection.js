'use strict';

var stdClass = require('./stdClass');

var Collection = module.exports = stdClass.extend({
	constructor:function(){
		var instance =  Collection.createInstance.call(this);

		instance.initialize.apply(instance, arguments);

		return instance;
	},
	initialize:function(){},


	create: function(attrs) {
		return this.Model.create(attrs);
	},


	equip: function(rawAttrs) {
		var that = this;
		var els = rawAttrs.filter(function (attrs) {

			if(that.query && that.query.where) {
				var where = that.query.where;

				var result = true;
				Object.keys(where).forEach(function(key) {
					if(!result) { return result; }

					// Debugging
					// console.log(String(where[key]), String(attrs[key]));

					if( String(where[key]) !== String(attrs[key]) ) {
						result=false;
					}
				});

				return result;

			} else {
				return true;
			}



		});

		that.length = 0;

		els.forEach(function(attrs) {
			var model = that.Model.raw2instance(attrs);
			that.push(model);
		});

	}
},{
	createInstance:function(){
		var instance = Object.create( Array.prototype );

			instance = (Array.apply( instance, arguments ) || instance);

		extend(instance, this);
		return instance;
	}
});
