'use strict';

var Model = require('./Model.js');
var Collection = require('./Collection.js');

var Resource = module.exports = function(store) {
	this.store = store;
	this.Models = {};

	this.modelRawObjects = [];

	this.__collections = [];
};

var proto = Resource.prototype;


proto._defineBaseModel = function(modelName, schema, config, extender) {
	var M = this.BaseModel = this.defineModel(modelName, schema, config, extender);
	return M;
};


proto.defineModel = function(modelName, schema, config, extender, ModelToExtend) {
	extender = extender || {};
	ModelToExtend = ModelToExtend || Model;


	config = extend(true, {}, Model.__baseConfig, config);


	var instanceExtender = extender.instance || {};

	var staticExtender = extend(true, {}, extender.statics, {
		schema: schema,
		resource: this,
		config: config
	});


	var ExtendedModel = this.Models[modelName] = ModelToExtend.extend(instanceExtender, staticExtender);

	this.store.model(modelName, ExtendedModel);

	return ExtendedModel;
};



proto.extendBaseModel = function(modelName, schema, config, extender) {
	schema = extend(true, {}, this.BaseModel.schema, schema);
	config = extend(true, {}, this.BaseModel.config, config);

	return this.defineModel(modelName, schema, config, extender, this.BaseModel);
};



proto.mergeRawData = function(/* Array */ rawData) {
	var that = this;
	var results = [];
	rawData.forEach(function(rawItem) {

		var BaseModel = that.BaseModel;

		var id = BaseModel._idGetter(rawItem);

		if(id) {
			var existing = that.modelRawObjects.filter(function(rawAttrs) {
				return (BaseModel._idGetter(rawAttrs) === id);
			})[0];

			if(existing) {
				// merge attrs
				extend(true, existing, rawItem);
				results.push(existing);
			} else {
				// push attrs
				that.modelRawObjects.push(rawItem);
				results.push(rawItem);
			}

		}

	});
	return results;
};










proto.findById = function(id) {
	var that = this;
	var attrs = this.modelRawObjects.filter(function(rawAttrs) {
		return (that.BaseModel._idGetter(rawAttrs) === id);
	})[0];

	if(attrs) {
		return this.BaseModel.raw2instance(attrs);
	}
};












proto.url = function() {
	return '';
};



proto.sync = function(method, url, data, query) {

	return this.store.sync(method, url, data, query);

};




proto.createCollection = function(Model, query) {

	var collection = new Collection();
	collection.Model = Model;
	collection.query = query;

	this.__collections.push(collection);

	return collection;

};

proto.equipCollections = function() {
	var that = this;
	this.__collections.forEach(function(collection) {
		collection.equip(that.modelRawObjects);
	});
};






