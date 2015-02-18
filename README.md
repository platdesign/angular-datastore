#angular datastore

## Example

Require `pd` to your angular-app.

	var myApp = angular.module('myApp', ['pd']);

Create a `backend` service, which defines your backend-structure.
	
	myApp.service('backend', function(DS){
	
		var store = DS.connect({
			url: './backend'
		});
		
		// Define Resources
		var Article = store.define('Article', {
			title: { type: String },
			author: {
				firstName: String,
				lastname: String,
				
				cats: [{
					name: String,
					birthdate: Date		
				}],
				
				dogs: {
					type: [{
						name: String,
						birthdate: Date
					}]
				}
			}
		},{
			url: '/articles',
			idAttr: '__id'
		});
		
		var Comment = store.define('Comment', {
			author: String,
			msg: String,
			articleId: Number
		}, {
			url: '/comments',
			idAttr: '_id'
		});
		
	
		Article.hasMany(Comment, { 
			as:	'comments',
			foreigenKey: 'articleId',
			parentKey: 'id'
		});
	
		return store;
	
	});
	

Use your backend-service in a controller of your application.

	myApp.controller(function($scope, backend){
	
		// Load a collection of models
		backend.model('Article').loadAll()
		.then(function(articles){
			$scope.articles = articles;
		});

		// Load one specific model by id
		backend.model('Article').loadById(123)
		.then(function(article){
			if(!article) { //model not found }
			
			$scope.article = article;
			
			// Load child collection
			article.comments.loadAll().then(...)
		});
	
	});
	
	
	
	