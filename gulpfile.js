'use strict';

var gulp = require('gulp');


// Register javascript tasks
var js = require('pd-gulp-js-task')(gulp);

js.register({
	options:{
		banner: {
			file: './banner.txt'
		}
	},
	assets: {
		src: './src/*.js',
		dest: './dist',
		browserify: {
			standalone: 'pdAutogrowInput'
		}
	}
});



