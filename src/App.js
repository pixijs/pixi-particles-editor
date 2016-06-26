(function(){

	// Import classes
	var NodeWebkitApp = include('cloudkid.NodeWebkitApp'),
		Editor = include('pixiparticles.Editor'),
		Menu = include('pixiparticles.Menu', false),
		Browser = include('cloudkid.Browser');

	/**
	*  The main application
	*  @class App
	*  @extends cloudkid.NodeWebkitApp
	*/
	var App = function()
	{
		NodeWebkitApp.apply(this);

		/**
		*  The instance of the editor
		*  @property {pixiparticles.Editor} editor
		*/
		this.editor = new Editor({
			framerate: "framerate",
			fps: 60,
			raf: true,
			debug: DEBUG,
			resizeElement: "content",
			uniformResize: false,
			responsive: true
		});
		
		if (APP)
		{
			/**
			*  Add the new menu
			*  @property {pixiparticles.Menu} menu
			*/
			this.menu = new Menu();
		}

		// Add Google Analytics for the web view only
		if (WEB)
		{
			/* jshint ignore:start */
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-54925270-1', 'auto');
			ga('send', 'pageview');
			/* jshint ignore:end */
		}
	};

	// Extend the prototype
	extend(App, NodeWebkitApp);


	// Assign to namespace
	namespace('pixiparticles').App = App;

	// The application
	window.app = new App();

}());