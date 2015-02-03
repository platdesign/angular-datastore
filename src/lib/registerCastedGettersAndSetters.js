'use strict';


var isFunction = function(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

module.exports = function registerCastedGettersAndSetters(model, values, schema, onChange) {

	Object.keys(schema).forEach(function(key) {
		var def = schema[key];

		if( isFunction(def) ) {
			def = {type:def};
		} else if (def instanceof Array) {
			def = {type:def};
		} else if (def.type && !def.type.type) {
			def = {type:def.type};
		} else if (!def.type || (def.type && !def.type.type)) {
			def = {type:def};
		}


		var caster = def.type && !def.type.type ? def.type : {};


		// type is a schema
		if( Object.prototype.toString.call(caster) === '[object Object]' ) {
			var item = {};
			values[key] = values[key] || {};

			registerCastedGettersAndSetters(item, values[key], caster, onChange);

			model.__defineGetter__(key, function() {
				return item;
			});

			model.__defineSetter__(key, function(val) {
				values[key] = val;
			});

		} else if( caster instanceof Array ) {
			var subDef = caster[0];

			values[key] = values[key] || [];

			var result = [];
			result.push = function(vals) {
				var item = {};

				item.destroy = function() {
					result.splice(result.indexOf(item), 1);
					onChange();
				};

				registerCastedGettersAndSetters(item, vals, subDef, onChange);
				return Array.prototype.push.apply(this, [item]);
			};
			values[key].forEach(function(val) {
				result.push(val);
			});

			model.__defineGetter__(key, function() {
				return result;
			});

			model.__defineSetter__(key, function(vals) {
				values[key] = vals;
			});


		} else {
			values[key] = values[key] || '';

			model.__defineGetter__(key, function() {
				return values[key];
			});

			model.__defineSetter__(key, function(val) {
				val = caster(val);
				if(onChange) { onChange(val); }

				values[key] = val;
			});
		}

	});

};
