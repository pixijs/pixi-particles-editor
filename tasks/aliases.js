module.exports = function(grunt)
{
	// Can build against a specific platform, for instance app:osx32
	// no platform will build for all platforms
	grunt.registerTask('app', 'Build the Application', function(platform)
	{
		grunt.task.run(
			'clean:main',
			'jshint:main',
			'uglify:app',
			'clean:css',
			'less:release',
			'libs',
			'exec:appModules',
			'nodewebkit:' + (platform || 'all')
		);
	});
	
	// Same as the app task except that the code is build in DEBUG mode
	grunt.registerTask('app-debug', 'Build the Application in debug mode', function(platform)
	{
		grunt.task.run(
			'clean:main',
			'jshint:main',
			'concat:main',
			'replace:app',
			'clean:css',
			'less:development',
			'libs-debug',
			'exec:appModules',
			'nodewebkit:' + (platform || 'all')
		);
	});

	// Package the app into the installers
	// which are user-friend packages for installing
	// on the user's platform
	grunt.registerTask('package', function(platform)
	{
		var tasks = ['clean:installers'];

		// Package a single platform
		if (platform)
		{
			tasks.push('exec:package' + platform);
		}
		// Package all platforms
		else
		{
			tasks.push(
				'exec:packagewin32',
				'exec:packagewin64',
				'exec:packageosx32',
				'exec:packageosx64'
			);
		}
		grunt.task.run(tasks);	
	});

	// Open the application directly
	grunt.registerTask('open', 'Open the App', function(platform)
	{
		if (!platform)
		{
			grunt.fail.fatal("Open must have a platform, e.g.,'osx64'");
			return;
		}
		grunt.task.run('exec:open' + platform);
	});
};