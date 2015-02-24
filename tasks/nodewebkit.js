module.exports = {
	options: {
		version: '0.11.6',
		buildDir: '<%= buildDir %>',
		macIcns: '<%= distFolder %>/assets/images/icon.icns',
		winIco: '<%= distFolder %>/assets/images/icon.ico',
		macZip: true
	},
	all: {
		options: {
			platforms: ['osx', 'win']
		},
		src: '<%= distFolder %>/**/*'
	},
	osx32: {
		options: {
			platforms: ['osx32']
		},
		src: '<%= nodewebkit.all.src %>'
	},
	osx64: {
		options: {
			platforms: ['osx64']
		},
		src: '<%= nodewebkit.all.src %>'
	},
	win32: {
		options: {
			platforms: ['win32']
		},
		src: '<%= nodewebkit.all.src %>'
	},
	win64: {
		options: {
			platforms: ['win64']
		},
		src: '<%= nodewebkit.all.src %>'
	}
};