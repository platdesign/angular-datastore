'use strict';


var stdClass = require('./stdClass');
var uriTemplateReplace = require('./uriTemplateReplace.js');
var registerGettersSetters = require('./registerCastedGettersAndSetters.js');



var Model = module.exports = stdClass.extend({
	constructor: function(attrs) {
		var _private = {};

		_private.attrs = attrs || {};


		this.__defineGetter__('id', function() {
			return this.static._idGetter(_private.attrs);
		});

		this.__private = function(key, setter) {
			if(setter || setter === null) {
				_private[key] = setter;
			} else {
				return _private[key];
			}
		};

		this._state('idle');
	},

	_state: function(set) {
		if(set) {
			this.__private('state', set);
		} else {
			return this.__private('state');
		}
	},

	_initializeSettersAndGetters: function() {

		var model = this;
		var statics = this.static;
		var schema = statics.schema;

		registerGettersSetters(model, model.__private('attrs'), schema, function onChange(newVal, key, parent, parentKey) {
			model.__private('lastChange', new Date().getTime());
			model._triggerAutosaver();
		}, 'model');

		if(statics.__children) {
			Object.keys(statics.__children).forEach(function(key) {
				model.__defineGetter__(key, function() {
					var M = statics.__children[key].extend();
					M.parent = model;
					return M;
				});
			});
		}

		this._initializeAutosaver();
	},



	initialize: function() {},


	set: function(attrs) {
		//this.__private('attrs', attrs);
		//this._initializeSettersAndGetters();



		var that = this;
		//var modelAttrs = this.__private('attrs');

		var oldAutsaveStatus = this.autosave;
		this.autosave = false;
		Object.keys(that.static.schema).forEach(function(key) {
			that[key] = attrs[key];
		});
		this.autosave = oldAutsaveStatus;
		//extend(true, modelAttrs, attrs);

	},

	_initializeAutosaver: function() {
		this.__autosaveTimer = undefined;
		this.autosave = true;
	},
	_triggerAutosaver: function() {
		if(this.autosave) {
			var that = this;

			clearTimeout(this.__autosaveTimer);
			this.__autosaveTimer = setTimeout(function() {
				if(that.autosave) {
					that.save();
				}
			}, this.static.config.autosaveTimeout || 800);
		}
	},







	sync: function(RESTMethod, query, body) {
		var url = this.url(RESTMethod);
		var conf = this.static.config.REST[RESTMethod];
		return this.static.resource.store.sync(conf.method, url, (conf.includeObj ? this : body ), query);
	},


	syncREST: function(conf, query, body) {
		var url = this.url(RESTMethod);
		return this.static.resource.store.sync(conf.method, url, (conf.includeObj ? this : body ), query);
	},

	syncSubRoute: function(method, subUrl, query, body) {
		var url = this.url() + subUrl;
		return this.static.resource.store.sync(method, url, body, query);
	},


	url: function(RESTMethod) {
		RESTMethod = RESTMethod || 'get';
		return (this.parent?this.parent.url('get'):'') + this.static.url(RESTMethod, this);
	},

	_urlTemplate2url: function(template) {
		return (this.parent ? this.parent.url('get') : '') + this.static._urlTemplate2url(template, this);
	},







	save: function() {
		var that = this;

		that._state('saving');
		var saveStart = new Date().getTime();

		return this.sync((this.id ? 'put' : 'post'))
		.then(function (rawAttrs) {

			if(that.__private('lastChange') < saveStart) {
				that.set(rawAttrs);
			}

			that._state('idle');
			return that;
		});


	},

	destroy: function() {
		this.sync('delete').then(function(attrs) {
			console.log('deleted');
		});
	},



},{

	__baseConfig: {
		idAttr: 'id',


		REST: {
			getIndex: {
				method: 'get',
				url: '',
				isArray: true,
				includeObj: false
			},
			get: {
				method: 'get',
				url: '/:id',
				isArray: false,
				includeObj: false
			},
			post: {
				method: 'post',
				url: '',
				isArray: false,
				includeObj: true
			},
			put: {
				method: 'put',
				url: '/:id',
				isArray: false,
				includeObj: true
			},
			delete: {
				method: 'delete',
				url: '/:id',
				isArray: false,
				includeObj: false
			}
		}
	},

	_idGetter: function(attrs) {
		return attrs[this.config.idAttr];
	},
	instantiate: function(attrs) {
		var instance = new this(attrs);
		instance.static = this;
		instance._initializeSettersAndGetters();
		instance.initialize(attrs);
		return instance;
	},

	raw2instance: function(raw) {
		if(this.config.raw2instance) {
			return this.config.raw2instance.apply(this, arguments);
		} else {
			return this.instantiate(raw);
		}
	},

	url: function(RESTMethod, data) {
		RESTMethod = RESTMethod || 'getIndex';
		var urlTemplate = this.config.REST[RESTMethod].url;
		return this._urlTemplate2url(urlTemplate, data);
	},

	_urlTemplate2url: function(template, scope) {
		return (this.parent ? this.parent.url() : '') + this.config.url + uriTemplateReplace(template, scope||{});
	},





	sync: function(RESTMethod, bodyData, query) {
		var that = this;
		var conf = this.config.REST[RESTMethod];

		if(conf) {

			var url = this.url(RESTMethod, bodyData);

			return this.resource.sync(conf.method, url, (conf.includeObj ? (bodyData||{}):null), query)
			.then(function(rawData) {

				if(conf.isArray) {
					that.resource.mergeRawData(rawData);

					var collection = that.resource.createCollection(that, query);
					that.resource.equipCollections();
					return collection;
				} else {
					var attrs = that.resource.mergeRawData([rawData])[0];
					return that.raw2instance(attrs);
				}

			});
		} else {
			E('REST-Error: Method not defined!');
		}

	},



	loadAll: function() {
		var query;
		if(this.parent) {
			query = {where:{}};
			query.where[ this.relationConfig.foreigenKey ] = this.parent[this.relationConfig.parentKey || 'id'];
		}
		return this.sync('getIndex', null, query);
	},

	loadById: function(id) {
		var existing = this.resource.findById(id);
		if(existing) {
			this.sync('get', {id:id});

			return this.resource.store._services.Q.when( this.cast( existing ) );
		}

		return this.sync('get', {id:id});
	},


	create: function(attrs) {
		var that = this;
		return this.sync('post', attrs).then(function(model) {
			that.resource.equipCollections();
			return model;
		});
	},

	createLocal: function(rawAttrs) {
		var attrs = this.resource.mergeRawData([rawAttrs])[0];
		var model = this.raw2instance(attrs);
		this.resource.equipCollections();
		return model;
	},







	hasMany: function(Model, config) {
		var copy = Model.extend();
		copy.relationConfig = config;
		copy.parent = this;
		this.__children = this.__children || {};
		this.__children[config.as] = copy;
	},


	// Cast model to this (important for url-building, parenting, etc)
	cast: function(model) {
		return this.raw2instance( model.__private('attrs') );
	},

















});
