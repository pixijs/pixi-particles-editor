module.exports = {
	app_modules : {
		command: 'npm install',
		cwd: '<%= distFolder %>',
		stdout: false,
	    stderr: false
	},
	createWinInstall: {
		cmd: 'makensis <%= installerDir %>/win.nsi'
	},
	createOSXInstall: {
		cmd: 'appdmg <%= installerDir %>/osx.json <%= buildDir %>/<%= build.name %>-Setup.dmg'
	},
	openOSXApp : {
		cmd: 'open <%= buildDir %>/<%= build.name %>/osx/<%= build.name %>.app'
	}
};