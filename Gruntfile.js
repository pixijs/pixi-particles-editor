module.exports = function(grunt)
{
	var path = require('path'),
		_ = grunt.util._;

	// Combine the game builder and current project
	// configs into one object
	grunt.initConfig(_.extend(

		// Setup the default game tasks
		require('grunt-game-builder')(grunt, { 
			autoInit: false,
			jsFolder : "deploy/assets/js"
		}), 

		// Setup the current project tasks
		require('load-grunt-config')(grunt, {
			// The path for the tasks
			configPath: path.join(process.cwd(), 'tasks'),
			autoInit: false, 

			// We don't want to reload builder
			loadGruntTasks: { pattern: [
				'grunt-*', 
				'!grunt-game-builder'
			] },
		})
	));
};