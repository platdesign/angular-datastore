'use strict';


var isFunction = function(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

module.exports = function registerCastedGettersAndSetters(model, values, schema, onChange, parentKey) {
	parentKey = parentKey || '';

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



		if(schema[key].set) {
			def.set = schema[key].set;
		}

		if(schema[key].get) {
			def.get = schema[key].get;
		}

		var caster = def.type && !def.type.type ? def.type : {};

		// type is a schema
		if( Object.prototype.toString.call(caster) === '[object Object]' ) {
			var item = {};
			values[key] = values[key] || {};

			registerCastedGettersAndSetters(item, values[key], caster, onChange, parentKey + '.' + key);

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

				var index = Array.prototype.push.apply(this, [item]);
				registerCastedGettersAndSetters(item, vals, subDef, onChange, parentKey + '.' + key+ '['+(index-1)+']');
				return index;
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
				var val = values[key];

				if(def.get) {
					val = def.get(val);
				}

				return val;
			});

			model.__defineSetter__(key, function(val) {

				if(def.set) {
					val = def.set(val);
				}

				val = caster(val);

				if(onChange) {
					var result = onChange(val, key, values, parentKey + '.' + key);

					if(result) {
						val = result;
					}
				}

				values[key] = val;
			});
		}

	});

};
