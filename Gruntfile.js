module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'public/sae/javascripts/*.js',
				'routes/*.js',
				'app.js',
				'../Sec-Angular-Express/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp','csp.json','*.log']
		},
		makecsp: {
			default_options: { //target with default_options
				options: {
				}
			}
		}
	});

	// This plugin provides the necessary task.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-csp-express');

	// By default, just run makecsp 

	grunt.registerTask('default', ['clean', 'jshint', 'makecsp']);
};
