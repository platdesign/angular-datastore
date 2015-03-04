'use strict';

var Resource = require('./Resource.js');
var E = require('./Error.js');


var Store = module.exports = function(config) {
	this.config = config || {};
	this.resources = {};
	this.Models = {};
};
var proto = Store.prototype;


proto._setServices = function(obj) {
	this._services = obj;
};


proto.define = function(resourceName, baseModelSchema, baseModelConfig, baseModelExtender) {
	var resource = this.resources[resourceName] = new Resource(this);

	return resource._defineBaseModel(resourceName, baseModelSchema, baseModelConfig, baseModelExtender);
};

proto.model = function(modelName, setter) {
	if(setter) {
		if(this.Models[modelName]) {
			E('Model ' + modelName+' already defined!');
		} else {
			this.Models[modelName] = setter;
		}
	} else {
		if(this.Models[modelName]) {
			return this.Models[modelName];
		} else {
			E('Model '+modelName+' not defined!');
		}
	}
};

proto.resource = function(resourceName) {
	if(this.resources[resourceName]) {
		return this.resources[resourceName];
	} else {
		E('Resource '+resourceName+' not defined!');
	}
};

proto.sync = function(method, url, body, query) {
	method = method.toLowerCase();

	var url = this.config.url + (url || '') + (query ? '?'+$.param(query) : '');

	return this._services.http[method]( url , body ).then(function(res) {
		return res.data;
	});
};
