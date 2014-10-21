module.exports = {
	options: {
		files : {
			'deploy/package.json' : 'version',
			'installer/win.nsi' : function(contents, version) {

				// Strip off any "-alpha" "-beta" "-rc" etc
				var extra = version.lastIndexOf('-');
				var parts = (extra > -1 ? version.substr(0, extra) : version).split('.');

				// Replace in the file contents and return
				return contents.replace(/(\!define VERSIONMAJOR) [0-9]+/, "$1 " + parts[0])
					.replace(/(\!define VERSIONMINOR) [0-9]+/, "$1 " + parts[1])
					.replace(/(\!define VERSIONBUILD) [0-9]+/, "$1 " + parts[2]);
			}
		}
	}
};