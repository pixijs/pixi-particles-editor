module.exports = function(grunt)
{
	grunt.registerTask('app', 'Build the Application', [
		'clean:main',
		'jshint:main',
		'uglify:app',
		'clean:css',
		'less:release',
		'libs',
		'exec:app_modules',
		'nodewebkit'
	]);
	
	grunt.registerTask('app-debug', 'Build the Application in debug mode', [
		'clean:main',
		'jshint:main',
		'concat_sourcemap:main', 
		'replace:app',
		'clean:css',
		'less:development',
		'libs-debug',
		'exec:app_modules',
		'nodewebkit'
	]);

	grunt.registerTask('package', [
		'clean:installers',
		'exec:createWinInstall',
		'exec:createOSXInstall'
	]);

	grunt.registerTask(
		'open', 
		'Open the OS X App', 
		['exec:openOSXApp']
	);

	grunt.registerTask(
		'live', 
		'Put the editor live to gh-pages', [
			'default', 
			'gh-pages'
		]
	);
};