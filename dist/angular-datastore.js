/*
@project	angular-datastore
@author		Christian Blaschke <mail@platdesign.de>
@version	0.0.0
@created	2015-02-03 18:10:42
*/
!function t(e,r,n){function i(s,c){if(!r[s]){if(!e[s]){var u="function"==typeof require&&require;if(!c&&u)return u(s,!0);if(o)return o(s,!0);var a=new Error("Cannot find module '"+s+"'");throw a.code="MODULE_NOT_FOUND",a}var f=r[s]={exports:{}};e[s][0].call(f.exports,function(t){var r=e[s][1][t];return i(r?r:t)},f,f.exports,t,e,r,n)}return r[s].exports}for(var o="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(t,e){"use strict";var r;try{r=angular.module("pd")}catch(n){r=angular.module("pd",[])}e.exports=r,r.provider("DS",t(1))},{1:10}],2:[function(t,e){"use strict";var r=t(1),n=e.exports=r.extend({constructor:function(){var t=n.createInstance.call(this);return t.initialize.apply(t,arguments),t},initialize:function(){},create:function(t){return this.Model.create(t)},equip:function(t){var e=this,r=t.filter(function(t){if(e.query&&e.query.where){var r=e.query.where,n=!0;return Object.keys(r).forEach(function(e){return n?void(String(r[e])!==String(t[e])&&(n=!1)):n}),n}return!0});e.length=0,r.forEach(function(t){var r=e.Model.raw2instance(t);e.push(r)})}},{createInstance:function(){var t=Object.create(Array.prototype);return t=Array.apply(t,arguments)||t,extend(t,this),t}})},{1:8}],3:[function(t,e){"use strict";e.exports=function(t){throw new Error(t)}},{}],4:[function(t,e){"use strict";{var r=t(2),n=t(3),i=t(1);e.exports=r.extend({constructor:function(t){var e={};e.attrs=t||{},this.__defineGetter__("id",function(){return this["static"]._idGetter(e.attrs)}),this.__private=function(t,r){return r?void(e[t]=r):e[t]}},_initializeSettersAndGetters:function(){var t=this,e=this["static"],r=e.schema;i(t,t.__private("attrs"),r,function(){t._triggerAutosaver()}),e.__children&&Object.keys(e.__children).forEach(function(r){t.__defineGetter__(r,function(){var n=e.__children[r].extend();return n.parent=t,n})}),this._initializeAutosaver()},initialize:function(){},set:function(t){var e=this,r=(this.__private("attrs"),this.autosave);this.autosave=!1,Object.keys(e["static"].schema).forEach(function(r){e[r]=t[r]}),this.autosave=r},_initializeAutosaver:function(){this.__autosaveTimer,this.autosave=!0},_triggerAutosaver:function(){if(this.autosave){var t=this;clearTimeout(this.__autosaveTimer),this.__autosaveTimer=setTimeout(function(){t.autosave&&t.save()},this["static"].config.autosaveTimeout||800)}},sync:function(t,e){var r=this.url(t),n=this["static"].config.REST[t];return this["static"].resource.store.sync(n.method,r,n.includeObj?this:null,e)},url:function(t){return t=t||"get",(this.parent?this.parent.url("get"):"")+this["static"].url(t,this)},save:function(){var t=this;return this.sync(this.id?"put":"post").then(function(e){return t.set(e),t})},destroy:function(){this.sync("delete").then(function(){console.log("deleted")})}},{__baseConfig:{idAttr:"id",REST:{getIndex:{method:"get",url:"",isArray:!0,includeObj:!1},get:{method:"get",url:"/:id",isArray:!1,includeObj:!1},post:{method:"post",url:"",isArray:!1,includeObj:!0},put:{method:"put",url:"/:id",isArray:!1,includeObj:!0},"delete":{method:"delete",url:"/:id",isArray:!1,includeObj:!1}}},_idGetter:function(t){return t[this.config.idAttr]},instantiate:function(t){var e=new this(t);return e["static"]=this,e._initializeSettersAndGetters(),e.initialize(t),e},raw2instance:function(t){return this.config.raw2instance?this.config.raw2instance.apply(this,arguments):this.instantiate(t)},url:function(t,e){t=t||"getIndex";var r=this.config.REST[t].url;return(this.parent?this.parent.url():"")+this.config.url+n(r,e||{})},sync:function(t,e,r){var n=this,i=this.config.REST[t];if(i){var o=this.url(t,e);return this.resource.sync(i.method,o,i.includeObj?e||{}:null,r).then(function(t){if(i.isArray){n.resource.mergeRawData(t);var e=n.resource.createCollection(n,r);return n.resource.equipCollections(),e}var o=n.resource.mergeRawData([t])[0];return n.raw2instance(o)})}E("REST-Error: Method not defined!")},loadAll:function(){var t;return this.parent&&(t={where:{}},t.where[this.relationConfig.foreigenKey]=this.parent[this.relationConfig.parentKey||"id"]),this.sync("getIndex",null,t)},loadById:function(t){var e=this.resource.findById(t);if(e){this.sync("get",{id:t});var r=this.resource.store._services.Q.defer();return r.resolve(e),r.promise}return this.sync("get",{id:t})},create:function(t){var e=this;return this.sync("post",t).then(function(){e.resource.equipCollections()})},createLocal:function(t){var e=this.resource.mergeRawData([t])[0],r=this.raw2instance(e);return this.resource.equipCollections(),r},hasMany:function(t,e){var r=t.extend();r.relationConfig=e,r.parent=this,this.__children=this.__children||{},this.__children[e.as]=r}})}},{1:7,2:8,3:9}],5:[function(t,e){"use strict";var r=t(2),n=t(1),i=e.exports=function(t){this.store=t,this.Models={},this.modelRawObjects=[],this.__collections=[]},o=i.prototype;o._defineBaseModel=function(t,e,r,n){var i=this.BaseModel=this.defineModel(t,e,r,n);return i},o.defineModel=function(t,e,n,i,o){i=i||{},o=o||r,n=extend(!0,{},r.__baseConfig,n);var s=i.instance||{},c=extend(!0,{},i.statics,{schema:e,resource:this,config:n}),u=this.Models[t]=o.extend(s,c);return this.store.model(t,u),u},o.extendBaseModel=function(t,e,r,n){return e=extend(!0,{},this.BaseModel.schema,e),r=extend(!0,{},this.BaseModel.config,r),this.defineModel(t,e,r,n,this.BaseModel)},o.mergeRawData=function(t){var e=this,r=[];return t.forEach(function(t){var n=e.BaseModel,i=n._idGetter(t);if(i){var o=e.modelRawObjects.filter(function(t){return n._idGetter(t)===i})[0];o?(extend(!0,o,t),r.push(o)):(e.modelRawObjects.push(t),r.push(t))}}),r},o.findById=function(t){var e=this,r=this.modelRawObjects.filter(function(r){return e.BaseModel._idGetter(r)===t})[0];return r?this.BaseModel.raw2instance(r):void 0},o.url=function(){return""},o.sync=function(t,e,r,n){return this.store.sync(t,e,r,n)},o.createCollection=function(t,e){var r=new n;return r.Model=t,r.query=e,this.__collections.push(r),r},o.equipCollections=function(){var t=this;this.__collections.forEach(function(e){e.equip(t.modelRawObjects)})}},{1:2,2:4}],6:[function(t,e){"use strict";var r=t(2),n=t(1),i=e.exports=function(t){this.config=t||{},this.resources={},this.Models={}},o=i.prototype;o._setServices=function(t){this._services=t},o.define=function(t,e,n,i){var o=this.resources[t]=new r(this);return o._defineBaseModel(t,e,n,i)},o.model=function(t,e){if(e)this.Models[t]?n("Model "+t+" already defined!"):this.Models[t]=e;else{if(this.Models[t])return this.Models[t];n("Model "+t+" not defined!")}},o.resource=function(t){return this.resources[t]?this.resources[t]:void n("Resource "+t+" not defined!")},o.sync=function(t,e,r,n){var e=this.config.url+(e||"")+(n?"?"+$.param(n):"");return this._services.http[t](e,r).then(function(t){return t.data})}},{1:3,2:5}],7:[function(t,e){"use strict";var r=function(t){return!!(t&&t.constructor&&t.call&&t.apply)};e.exports=function n(t,e,i,o){Object.keys(i).forEach(function(s){var c=i[s];r(c)?c={type:c}:c instanceof Array?c={type:c}:c.type&&!c.type.type?c={type:c.type}:(!c.type||c.type&&!c.type.type)&&(c={type:c});var u=c.type&&!c.type.type?c.type:{};if("[object Object]"===Object.prototype.toString.call(u)){var a={};e[s]=e[s]||{},n(a,e[s],u,o),t.__defineGetter__(s,function(){return a}),t.__defineSetter__(s,function(t){e[s]=t})}else if(u instanceof Array){var f=u[0];e[s]=e[s]||[];var h=[];h.push=function(t){var e={};return e.destroy=function(){h.splice(h.indexOf(e),1),o()},n(e,t,f,o),Array.prototype.push.apply(this,[e])},e[s].forEach(function(t){h.push(t)}),t.__defineGetter__(s,function(){return h}),t.__defineSetter__(s,function(t){e[s]=t})}else e[s]=e[s]||"",t.__defineGetter__(s,function(){return e[s]}),t.__defineSetter__(s,function(t){t=u(t),o&&o(t),e[s]=t})})}},{}],8:[function(t,e){e.exports=t(1)},{1:11}],9:[function(t,e){e.exports=function(t,e){var r=t;for(var n in e)r=r.replace(":"+n,encodeURIComponent(e[n]));if(Array.isArray(e))for(var i=0;i<e.length;i++)r=r.replace("*",encodeURIComponent(e[i]));if(r.match(/[\*:]/))throw new Error("There were unexpanded params: "+r);return r}},{}],10:[function(t,e){"use strict";var r=t(1);e.exports=function(){var t={};this.$get=["$http","$q",function(e,n){return t.connect=function(t){var i=new r(t);return i._setServices({http:e,Q:n}),i},t}]}},{1:6}],11:[function(t,e,r){!function(t,n){var i="stdClass";"function"==typeof define&&define.amd?define([i],n):"object"==typeof r?e.exports=n():t[i]=n()}(this,function(){var t=function(t){var e=Array.prototype.slice.call(arguments,1);for(var r in e){var n=e[r];for(var i in n)t[i]=n[i]}return t},e=function(){};return e.extend=function(e,r){var n,i=this;n=e&&Object.prototype.hasOwnProperty.call(e,"constructor")?e.constructor:function(){return i.apply(this,arguments)},t(n,i,r);var o=function(){this.constructor=n};return o.prototype=i.prototype,n.prototype=new o,e&&t(n.prototype,e),n.__super__=i.prototype,n},e.helper={extend:t},e})},{}]},{},[1]);