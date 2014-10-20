module.exports = {
	css: {
		files: [
			'<%= build.css.main %>',
			'<%= build.file %>',
			'src/less/**/*.less'
		],
		tasks: [
			'less:development'
		]
	}
};