module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    makecsp: {
	  default_options: { //target with default_options
		  options: {
			  expressDir: "/vagrant/sae-server"
		  }
	  }
	}
  });

  // This plugin provides the necessary task.
  grunt.loadNpmTasks('grunt-csp-express');

  // By default, just run makecsp 
  grunt.registerTask('default', ['makecsp']);
};
