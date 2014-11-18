(function(){

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		Editor = pixiparticles.Editor,
		Menu = pixiparticles.Menu,
		Browser = cloudkid.Browser;

	/**
	*  The main application
	*  @class App
	*  @extends cloudkid.NodeWebkitApp
	*  @constructor
	*  @param {object} [options] cloudkid.Application options
	*/
	var App = function(options)
	{
		NodeWebkitApp.apply(this);

		/**
		*  The instance of the editor
		*  @property {pixiparticles.Editor} editor
		*/
		this.editor = new Editor(options);
		
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
	var p = App.prototype = Object.create(NodeWebkitApp.prototype);


	// Assign to namespace
	namespace('pixiparticles').App = App;

}());