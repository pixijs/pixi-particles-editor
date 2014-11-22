module.exports = function(grunt)
{
	require('project-grunt')(grunt, {
		data: { 
			buildDir : './build',
			installerDir : './installer'
		}
	});
};