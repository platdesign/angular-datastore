'use strict';

var ngModule;

try {
	ngModule = angular.module('pd');
} catch(err) {
	ngModule = angular.module('pd', []);
}

module.exports = ngModule;


ngModule.provider('DS', require('./providers/DS.js') );
