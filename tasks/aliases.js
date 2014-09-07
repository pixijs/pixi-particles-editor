module.exports = function(grunt)
{
	grunt.registerTask(
		'live', 
		'Put the editor live to gh-pages', [
			'default', 
			'gh-pages'
		]
	);
};