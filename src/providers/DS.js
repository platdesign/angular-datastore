'use strict';

var Store = require('../lib/Store.js');
var Types = require('../lib/Types.js');

module.exports = function() {

	var service = {};

	this.$get = ['$http', '$q', function($http, $q) {

		service.connect= function(options) {
			var store = new Store(options);
			store._setServices({
				http: $http,
				Q: $q
			});
			return store;
		};

		service.Types = Types;

		return service;

	}];

};
