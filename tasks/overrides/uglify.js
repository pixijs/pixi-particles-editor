module.exports = {
	main: {
		files: {
			'<%= jsFolder %>/main.js': '<%= build.js.main %>'
		},
		options: {
			compress: {
				global_defs: {
					"DEBUG": false,
					"RELEASE": true,
					"WEB": true,
					"APP": false 
				},
				dead_code: true,
				drop_console: true
			}
		}
	},
	app: {
		files: '<%= uglify.main.files %>',
		options: {
			compress: {
				global_defs: {
					"DEBUG": false,
					"RELEASE": true,
					"WEB": false,
					"APP": true 
				},
				dead_code: true,
				drop_console: true
			}
		}
	}
};