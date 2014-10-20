module.exports = {
	options: {
		version: '0.10.5',
		buildDir: '<%= buildDir %>',
		macIcns: '<%= distFolder %>/assets/images/icon.icns',
		winIco: '<%= distFolder %>/assets/images/icon.ico',
		platforms: ['osx', 'win']
	},
	// Files to include
	src: '<%= distFolder %>/**/*'
};