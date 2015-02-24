(function(undefined){
	
	/**
	*  Utility to check whether an update is available for the app. For this to work
	*  the package.json must contain a respository.url property and the GitHub account
	*  must uses Semantic Versioning and tagged releases.
	*  @class UpdateChecker
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [remindHours=2] Numer of hours until check for another update
	*/
	var UpdateChecker = function(remindHours)
	{
		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.UpdateChecker";
		}

		// The number of seconds until we can try another update
		// this remove the nag-factor when opening the app every time
		remindHours = remindHours || 2; 

		// The last time that we checked for updates
		var lastUpdateCheck = localStorage.getItem('lastUpdateCheck') || 0;

		// Check against the last time we updates
		// reminderSec need to be converted to milliseconds to compare to now()
		if (Date.now() - lastUpdateCheck <= remindHours * 1000 * 3600)
		{
			if (true)
			{
				console.log("Ignore update until the blocker has expired");
			}
			return;
		}

		if (true)
		{
			console.log("Checking for updates...");
		}

		/**
		*  The repository URL
		*  @property {string} repository
		*/
		this.repository = null;

		/**
		*  The current tag
		*  @property {string} currentTag
		*/
		this.currentTag = null;

		/**
		*  Add a destroyed check
		*  @property {boolean} _destroyed
		*  @default
		*/
		this._destroyed = false;

		// The name of the package file
		var packagePath = "package.json";
		var self = this;

		// Load the package json file
		$.getJSON(packagePath, function(data){

			if (self._destroyed) return;

			if (!data.repository || data.repository.url.search(/github\.com/) === -1)
			{
				if (true)
				{
					console.debug("No repository set in the package.json or " +
						"repository url not supported (only GitHub), unable " + 
						"to check for updates.");
				}
				return;
			}

			self.currentTag = data.version;
			self.repository = data.repository.url;

			// Format the repository url to get the tags
			var url = data.repository.url
				.replace('http:', 'https:')
				.replace('github.com', 'api.github.com/repos') + "/releases";
				
			// Load the tags json from the github api
			$.getJSON(url, self.onTagsLoaded);
		});

		// Bind functions
		this.onTagsLoaded = this.onTagsLoaded.bind(this);
	};

	// The prototype reference
	var p = UpdateChecker.prototype;

	/**
	*  Handler for loading the releases JSON from the github API
	*  @method onTagsLoaded
	*  @param {array} releases The list of releases
	*/
	p.onTagsLoaded = function(releases)
	{
		if (this._destroyed) return;

		localStorage.setItem('lastUpdateCheck', Date.now());

		if (!releases || !Array.isArray(releases) || releases.length === 0)
		{
			if (true)
			{
				console.debug("No releases found for this project, no update-check.");
			}
			return;
		}

		var semver = require('semver');
		var i, len = releases.length, release, tag;

		for(i = 0; i < len; i++)
		{
			release = releases[i];
			tag = release.tag_name;

			// Exclude pre-releases
			if (!release.prerelease && 
				semver.valid(tag) && 
				semver.gt(tag, this.currentTag))
			{
				if (confirm("An update is available. Download now?"))
				{
					if (true)
					{
						// Load native UI library.
						var gui = require('nw.gui');

						// Open URL with default browser.
						gui.Shell.openExternal(this.repository + '/releases/tag/' + tag);
					}
					if (false)
					{
						window.open(this.repository + '/releases/tag/' + tag);
					}
				}
				return;
			}
		}

		if (true)
		{
			console.log("No updates");
		}
	};

	/**
	*  Don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;
	};

	// Assign to window
	namespace('cloudkid').UpdateChecker = UpdateChecker;

}());
(function(undefined){

	/**
	*  Create the file browser
	*  @class Browser
	*  @namespace cloudkid
	*/
	var Browser = function()
	{
		instance = this;

		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.Browser";
		}

		// Add the hidden input for browsing files
		this.file = $('<input type="file" />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.removeAttr('accept');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});

		// Add the hidden input for browsing files
		this.saveAs = $('<input type="file" nwsaveas />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.attr('nwsaveas', '');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});


		// Add the hidden input for browsing folders
		var param = true ? 'nwdirectory' : 'webkitdirectory';
		this.folder = $('<input type="file" '+param+' />')
			.css('visibility', 'hidden')
			.change(function(e){
				var input = $(this);
				var folder = input.val();
				var callback = instance._folderCallback;
				instance._folderCallback = null;
				input.val('');
				callback(folder);
			});

		// Add to the body
		$('body').append(
			this.file, 
			this.folder,
			this.saveAs
		);

		// The callback functions
		this._fileCallback = null;
		this._folderCallback = null;
	};

	var p = Browser.prototype = {};

	/**
	*  Singleton instance of the browser
	*/
	var instance;

	/**
	*  Create a new version of the Browser
	*  @method  init
	*  @static
	*  @return {cloudkid.Browser} Instnace of the file browser
	*/
	Browser.init = function()
	{
		if (instance) 
		{
			throw "Only once instance file created at once";
		}
		return new Browser();
	};

	/**
	*  Get the single instance
	*  @property {cc.Browser} instance
	*/
	Object.defineProperty(Browser, "instance", 
		{
			get : function()
			{ 
				return instance; 
			}
		}
	);

	/**
	*  Browse for a folder
	*  @method  folder
	*  @static
	*  @param  {Function} callback The function to call when we selected a folder
	*/
	Browser.folder = function(callback, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.folder.removeAttr('nwworkingdir');
		if (true && workingDir)
		{
			instance.folder.attr('nwworkingdir', workingDir);
		}
		instance._folderCallback = callback;
		instance.folder.trigger('click');
	};

	/**
	*  Browse for a file
	*  @method  file
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.file = function(callback, types, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.file.removeAttr('accept');
		if (types)
		{
			instance.file.attr('accept', types);
		}
		if (true && workingDir)
		{
			instance.file.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.file.trigger('click');
	};

	/**
	*  Save file as
	*  @method  saveAs
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.saveAs = function(callback, filename, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.saveAs.attr('nwsaveas', filename || "");
		if (true && workingDir)
		{
			instance.saveAs.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.saveAs.trigger('click');
	};

	/**
	*  Remove the singleton
	*  @method destroy
	*/
	Browser.destroy = function()
	{
		if (instance)
		{
			instance.destroy();
		}
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.file.off('change').remove();
		this.folder.off('change').remove();
		this.saveAs.off('change').remove();
		this.file = null;
		this.folder = null;
		this.saveAs = null;
		instance = null;
	};

	// Assign to namespace
	namespace('cloudkid').Browser = Browser;

}());
(function(window, undefined){

	window.cloudkid = window.cloudkid || {};

	/**
	*  A base web kit application
	*  @class NodeWebkitApp
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [updaterTime=2] The minimum amount of time before reminding the user they're
	*          is a new update for the application.
	*/
	var NodeWebkitApp = function(updaterTime)
	{
		/**
		*  The optional utility that checks for update
		*  @property {cloudkid.UpdateChecker} updater
		*/
		this.updater = null;

		/**
		*  The file browser which uses a file input form element behind the scenes
		*  the Browser class can also be called statically
		*  @property {cloudkid.Browser} browser
		*/
		this.browser = null;

		/**
		*  Application only, the node-webkit gui module
		*  @property {nw.gui} gui
		*/
		this.gui = null;

		/**
		*  The main node webkit window
		*  @property {Window} main
		*/
		this.main = null;

		/**
		*  If we can resize the window
		*  @property {Boolean} resizable
		*/
		this.resizable = true;

		/**
		*  The contents of the package JSON file
		*  @property {object} packageData
		*/
		this.packageData = null;

		if (true)
		{
			var gui = this.gui = require('nw.gui');
			var main = this.main = this.gui.Window.get();
			var fs = require('fs');

			var pack = this.packageData = JSON.parse(fs.readFileSync('package.json'));
			var winConfig = pack.window;

			this.resizable = winConfig.resizable !== undefined ? 
				winConfig.resizable : true;

			if (true)
			{
				// Show the development tools
				main.showDevTools();

				// Add a listener for debug function key commands
				window.addEventListener('keydown', this._onKeyDown.bind(this));
			}

			// Listen for when the window close and remember window size
			main.on('close', this._onClose.bind(this));

			// Load the saved window size
			try
			{
				var rect = JSON.parse(localStorage.getItem('windowSettings') || 'null');
				if (rect)
				{
					if (this.resizable)
					{
						main.width = rect.width;
						main.height = rect.height;
					}
					else
					{
						main.height = winConfig.height;
						main.width = winConfig.width;
					}
					main.x = rect.x;
					main.y = rect.y;
				}
				else if (!this.resizable)
				{
					main.height = winConfig.height;
					main.width = winConfig.width;
				}
			}
			catch(e){}

			// Check for application updates
			if (cloudkid.UpdateChecker)
			{
				this.updater = new cloudkid.UpdateChecker(updaterTime);
			}

			// Initialize the browser utility
			if (cloudkid.Browser)
			{
				this.browser = cloudkid.Browser.init();
			}

			// The application is hidden by default, lets show it
			main.show();
		}

		// Catch any uncaught errors or fatal exceptions
		if (true)
		{
			process.on("uncaughtException", this._handleErrors.bind(this));
		}
		if (false)
		{
			window.onerror = this._handleErrors.bind(this);
		}
	};

	// Reference to the prototype
	var p = NodeWebkitApp.prototype;

	if (true)
	{
		/**
		*  Key handler for the window key down
		*  @method _onKeyDown
		*  @private
		*  @param {event} e The window keyboard event
		*/
		p._onKeyDown = function(e)
		{
			if (e.keyIdentifier === 'F12')
			{
				this.main.showDevTools();
			}
			else if (e.keyIdentifier === 'F5')
			{
				location.reload();
			}
		};
	}

	/**
	*  Handle any fatal or uncaught errors
	*  @method _handleErrors
	*  @method private
	*  @param {error} e The error thrown
	*/
	p._handleErrors = function(e)
	{
		if (false)
		{
			alert(e);
		}
		if (true)
		{
			console.error(e);
			if (e.stack)
			{
				console.error(e.stack);
			}
		}
	};

	/**
	*  Handler when the main node-webkit window closes
	*  @method _onClose
	*  @method private
	*/
	p._onClose = function()
	{
		var main = this.main;
		var gui = this.gui;

		var rect = {
			x : main.x,
			y : main.y
		};

		if (this.resizable)
		{
			rect.width = main.width;
			rect.height = main.height;
		}

		localStorage.setItem('windowSettings', JSON.stringify(rect));
		main.hide();

		if (this.browser)
		{
			this.browser.destroy();
			this.browser = null;
		}

		if (this.updater)
		{
			this.updater.destroy();
			this.updater = null;
		}

		this.close();
		gui.App.closeAllWindows();
		gui.App.quit();
	};

	/**
	*  Called whenever the application closes
	*  @method close
	*/
	p.close = function()
	{
		// Implementation specific
	};

	// Assign to namespace
	namespace('cloudkid').NodeWebkitApp = NodeWebkitApp;

}(window));
(function(){

if (true)
{

	// Import node modules
	var gui = require('nw.gui'),
		SubMenu = gui.Menu,
		Window = gui.Window,
		MenuItem = gui.MenuItem,
		isOSX = process.platform === 'darwin';
	
	/**
	*  Application-only system menu
	*  @class Menu
	*/
	var Menu = function()
	{
		var main = Window.get();

		/**
		*  The root menu
		*  @property {gui.Menu} parent
		*/
		this.parent = new SubMenu({ type: 'menubar' });

		if (isOSX)
		{
			// Create the build in mac menubar
			// this needs to happen BEFORE assigning the menu
			this.parent.createMacBuiltin("PixiParticlesEditor", {
				hideEdit: false,
				hideWindow: true
			});
		}

		// Add menu access to dev tools
		if (true)
		{
			// mac already has the windows menu
			if (isOSX)
			{
				var items = this.parent.items;
				this.winMenu = items[items.length - 1].submenu;
				this.addSeparator(this.winMenu);
			}
			else
			{
				this.winMenu = new SubMenu();
				this.parent.append(new MenuItem({
					label: 'Window',
					submenu: this.winMenu
				}));
			}

			// Add menu access for the dev console
			this.addItem({
				label: "Show Developer Tools",
				key: "j",
				modifiers: "cmd-alt",
				click: function()
				{
					main.showDevTools();
				}
			}, this.winMenu);
		}

		// Assign the new menu to the window
		main.menu = this.parent;
	};

	var p = Menu.prototype;

	/**
	*  Add a new item to a menu
	*  @method addItem
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the item to
	*/
	p.addItem = function(settings, submenu)
	{
		var item = new MenuItem(settings);
		submenu.append(item);
		return item;
	};

	/**
	*  Add a new separator to a menu
	*  @method addSeparator
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the separator to
	*/
	p.addSeparator = function(submenu)
	{
		submenu.append(new MenuItem({
			type: 'separator'
		}));
	};

	// Assign to namespace
	namespace('pixiparticles').Menu = Menu;
}

}());
(function($){

	var EventDispatcher = include('springroll.EventDispatcher');

	/**
	*  The class for interacting with the interface
	*  @class EditorInterface
	*/
	var EditorInterface = function(spawnTypes)
	{
		EventDispatcher.call(this);

		this.spawnTypes = spawnTypes;

		var elements = [
			"alphaStart",
			"alphaEnd",
			"scaleStart",
			"scaleEnd",
			"minimumScaleMultiplier",
			"colorStart",
			"colorEnd",
			"speedStart",
			"speedEnd",
			"accelX",
			"accelY",
			"startRotationMin",
			"startRotationMax",
			"rotationSpeedMin",
			"rotationSpeedMax",
			"lifeMin",
			"lifeMax",
			"blendMode",
			"customEase",
			"subclass",
			"extraData",
			"emitFrequency",
			"emitLifetime",
			"emitMaxParticles",
			"emitSpawnPosX",
			"emitSpawnPosY",
			"emitAddAtBack",
			"emitSpawnType",
			"emitRectX",
			"emitRectY",
			"emitRectW",
			"emitRectH",
			"emitCircleX",
			"emitCircleY",
			"emitCircleR",
			"emitParticlesPerWave",
			"emitParticleSpacing",
			"emitAngleStart",
			"defaultConfigSelector",
			"defaultImageSelector",
			"configUpload",
			"configPaste",
			"imageUpload",
			"imageDialog",
			"imageList",
			"refresh",
			"loadConfig",
			"downloadConfig",
			"configDialog",
			"configConfirm",
			"imageConfirm",
			"addImage",
			"stageColor",
			"content",
			"renderer"
		];

		for (var i = 0; i < elements.length; i++)
		{
			this[elements[i]] = $("#"+elements[i]);
		}

		this.downloadConfig.click(this.download.bind(this));
		this.init();
	};

	var p = extend(EditorInterface, EventDispatcher);

	p.changed = function()
	{
		this.trigger('change');
	};

	p.init = function()
	{
		var self = this;
		var app = springroll.Application.instance;
		var changed = this.changed.bind(this);

		//enable tooltips for any element with a title attribute
		$("[data-toggle='tooltip']").tooltip({
			container: 'body',
			animation: false
		});

		this.alphaStart.slider().data('slider').on('slide', changed);
		this.alphaEnd.slider().data('slider').on('slide', changed);

		$(".spinner").each(function()
			{
				$(this).TouchSpin({
					verticalbuttons: true,
					min: parseFloat($(this).attr("data-min")) || -1000000,
					max: parseFloat($(this).attr("data-max")) || 1000000,
					step: parseFloat($(this).attr("data-step")) || 1,
					decimals: parseFloat($(this).attr("data-decimals")) || 1,
					forcestepdivisibility: "none"
				});
			});

		$('.bootstrap-touchspin-prefix, bootstrap-touchspin-postfix').remove();

		//set up all sliders to get changed by their text inputs
		//this also changes the text input, which clamps values in the sliders
		$(".spinner").change(function()
			{
				$(this).val($(this).val().replace(/[^0-9.-]/g,''));
				changed();
			});

		//enable color pickers
		$(".colorPicker").each(function()
			{
				$(this).minicolors(
				{
					control: 'hue',
					defaultValue: '',
					inline: false,
					letterCase: 'lowercase',
					position: 'top right',
					change: function(hex, opacity)
					{
						if( !hex ) return;
						changed();
					},
					theme: 'bootstrap'
				});
			});

		this.configDialog.on("show.bs.modal", function()
			{
				//reset the dialog before displaying it
				self.defaultConfigSelector
					.find("option:contains('-Default Emitters-')")
					.prop("selected",true);
				self.configUpload.wrap('<form>').parent('form').trigger('reset');
				self.configUpload.unwrap();
				self.configPaste.val("");
			});

		this.imageDialog.on("show.bs.modal", function()
			{
				//reset the dialog before displaying it
				self.defaultImageSelector
					.find("option:contains('-Default Images-')")
					.prop("selected",true);
				self.imageUpload.wrap('<form>').parent('form').trigger('reset');
				self.imageUpload.unwrap();
			});

		//enable the renderer toggle
		this.renderer.find('input').on("change", function()
			{
				self.trigger('renderer', this.value);
				changed();
			});

		//enable blend mode selector
		this.blendMode.on("change", changed);

		//listen to custom ease changes
		this.customEase.on("input", changed);

		//enable particle class selector
		this.subclass.on("change", changed);

		//listen to extra data changes
		this.extraData.on("input", changed);

		var spawnTypes = this.spawnTypes;

		//enable spawn type stuff
		this.emitSpawnType.change(function(event)
			{
				var value = self.emitSpawnType.val();
				for(var i = 0; i < spawnTypes.length; ++i)
				{
					if(spawnTypes[i] == value)
						$(".settings-" + spawnTypes[i]).show();
					else
						$(".settings-" + spawnTypes[i]).hide();
				}
			});

		// // Update the background color
		this.stageColor.change(function(e)
			{
				var inputColor = self.stageColor.val();
				var color = inputColor.replace(/[^abcdef0-9]/ig, '');
				if (color != inputColor)
				{
					self.stageColor.val(color);
				}
				if (color.length == 6)
				{
					self.trigger('stageColor', color);
				}
			});
	};

	/**
	*  Set the interface to the config
	*  @method set
	*  @param {object} config The emitter configuration setting
	*/
	p.set = function(config)
	{
		//particle settings
		this.alphaStart.data('slider').setValue(config.alpha ? config.alpha.start : 1);
		this.alphaEnd.data('slider').setValue(config.alpha ? config.alpha.end : 1);
		this.scaleStart.val(config.scale ? config.scale.start : 1);
		this.scaleEnd.val(config.scale ? config.scale.end : 1);
		this.minimumScaleMultiplier.val(config.scale ? (config.scale.minimumScaleMultiplier || 1) : 1);
		this.colorStart.minicolors("value", config.color ? config.color.start : "FFFFFF");
		this.colorEnd.minicolors("value", config.color ? config.color.end : "FFFFFF");
		this.speedStart.val(config.speed ? config.speed.start : 0);
		this.speedEnd.val(config.speed ? config.speed.end : 0);
		this.accelX.val(config.acceleration ? config.acceleration.x : 0);
		this.accelY.val(config.acceleration ? config.acceleration.y : 0);
		this.startRotationMin.val(config.startRotation ? config.startRotation.min : 0);
		this.startRotationMax.val(config.startRotation ? config.startRotation.max : 0);
		this.rotationSpeedMin.val(config.rotationSpeed ? config.rotationSpeed.min : 0);
		this.rotationSpeedMax.val(config.rotationSpeed ? config.rotationSpeed.max : 0);
		this.lifeMin.val(config.lifetime ? config.lifetime.min : 1);
		this.lifeMax.val(config.lifetime ? config.lifetime.max : 1);
		this.customEase.val(config.ease ? JSON.stringify(config.ease) : "");
		this.extraData.val(config.extraData ? JSON.stringify(config.extraData, null, "    ") : "");

		var blendMode;
		// //ensure that the blend mode is valid
		if(config.blendMode && cloudkid.ParticleUtils.getBlendMode(config.blendMode))
		{
			//make sure the blend mode is in the format we want for our values
			blendMode = config.blendMode.toLowerCase();
			while(blendMode.indexOf(" ") >= 0)
				blendMode = blendMode.replace("_");
		}
		else//default to normal
		{
			blendMode = "normal";
		}
		this.blendMode.find("option[value='" + blendMode + "']").prop("selected",true);

		//reset the particle class each time a file is loaded
		this.subclass.find("option[value='default']").prop("selected",true);

		//emitter settings
		this.emitFrequency.val(parseFloat(config.frequency) > 0 ? parseFloat(config.frequency) : 0.5);
		this.emitLifetime.val(config.emitterLifetime || -1);
		this.emitMaxParticles.val(config.maxParticles || 1000);
		this.emitSpawnPosX.val(config.pos ? config.pos.x : 0);
		this.emitSpawnPosY.val(config.pos ? config.pos.y : 0);
		this.emitAddAtBack.prop("checked", !!config.addAtBack);

		//spawn type
		var spawnType = config.spawnType,
			spawnTypes = this.spawnTypes;

		if(spawnTypes.indexOf(spawnType) == -1)
			spawnType = spawnTypes[0];

		//update dropdown
		this.emitSpawnType.find("option[value='" + spawnType + "']").prop("selected",true);

		//hide non-type options
		for(var i = 0; i < spawnTypes.length; ++i)
		{
			if(spawnTypes[i] == spawnType)
				$(".settings-" + spawnTypes[i]).show();
			else
				$(".settings-" + spawnTypes[i]).hide();
		}

		// //set or reset these options
		this.emitRectX.val(config.spawnRect ? config.spawnRect.x : 0);
		this.emitRectY.val(config.spawnRect ? config.spawnRect.y : 0);
		this.emitRectW.val(config.spawnRect ? config.spawnRect.w : 0);
		this.emitRectH.val(config.spawnRect ? config.spawnRect.h : 0);
		this.emitCircleX.val(config.spawnCircle ? config.spawnCircle.x : 0);
		this.emitCircleY.val(config.spawnCircle ? config.spawnCircle.y : 0);
		this.emitCircleR.val(config.spawnCircle ? config.spawnCircle.r : 0);
		this.emitParticlesPerWave.val(config.particlesPerWave > 0 ? config.particlesPerWave : 1);
		this.emitParticleSpacing.val(config.particleSpacing ? config.particleSpacing : 0);
		this.emitAngleStart.val(config.angleStart ? config.angleStart : 0);
	};

	/**
	*  Get the config
	*  @method get
	*  @return {object} The config settings
	*/
	p.get = function()
	{
		var output = {};

		// particle settings
		var start = parseFloat(this.alphaStart.data('slider').getValue());
		var end = parseFloat(this.alphaEnd.data('slider').getValue());
		output.alpha = {
			start: start == start ? start : 1,
			end: end == end ? end : 1
		};
		output.scale = {
			start: parseFloat(this.scaleStart.val()) || 1,
			end: parseFloat(this.scaleEnd.val()) || 1,
			minimumScaleMultiplier: parseFloat(this.minimumScaleMultiplier.val()) || 1
		};
		output.color = {
			start: this.colorStart.val() || "#ffffff",
			end: this.colorEnd.val() || "#ffffff"
		};
		output.speed = {
			start: parseFloat(this.speedStart.val()) || 0,
			end: parseFloat(this.speedEnd.val()) || 0
		};
		output.acceleration = {
			x: parseFloat(this.accelX.val() || 0),
			y: parseFloat(this.accelY.val() || 0)
		};
		output.startRotation = {
			min: parseFloat(this.startRotationMin.val()) || 0,
			max: parseFloat(this.startRotationMax.val()) || 0
		};
		output.rotationSpeed = {
			min: parseFloat(this.rotationSpeedMin.val()) || 0,
			max: parseFloat(this.rotationSpeedMax.val()) || 0
		};
		output.lifetime = {
			min: parseFloat(this.lifeMin.val()) || 1,
			max: parseFloat(this.lifeMax.val()) || 1
		};
		output.blendMode = this.blendMode.val();
		var val = this.customEase.val();
		if(val)
		{
			try{
				//convert the ease value to an object to ensure that is an Array
				//and so it can be converted into json properly
				//by using eval, we are a little less strict on syntax.
				/* jshint ignore:start */
				eval("val = " + val + ";");
				/* jshint ignore:end */
				//required to be an array, we won't bother checking for the required properties
				//Honor system, folks!
				if(val && val instanceof Array)
				{
					output.ease = val;
				}
			}
			catch(e)
			{
				Debug.error("Error evaluating easing data: " + e.message);
			}
		}
		val = this.extraData.val();
		if(val)
		{
			try{
				//convert the ease value to an object to ensure that is an Array
				//and so it can be converted into json properly
				//by using eval, we are a little less strict on syntax.
				/* jshint ignore:start */
				eval("val = " + val + ";");
				/* jshint ignore:end */
				if(val)
				{
					output.extraData = val;
				}
			}
			catch(e)
			{
				//don't log stuff, becaus there will be tons of errors while people type stuff
				//Debug.error("Error evaluating easing data: " + e.message);
			}
		}

		//emitter settings
		var frequency = this.emitFrequency.val();
		//catch 0, NaN, and negative values
		output.frequency = parseFloat(frequency) > 0 ? parseFloat(frequency) : 0.5;
		output.emitterLifetime = parseFloat(this.emitLifetime.val()) || -1;
		output.maxParticles = parseInt(this.emitMaxParticles.val()) || 1000;
		output.pos = {
			x: parseFloat(this.emitSpawnPosX.val() || 0),
			y: parseFloat(this.emitSpawnPosY.val() || 0)
		};
		output.addAtBack = this.emitAddAtBack.prop("checked");

		//spawn type stuff
		var spawnType = output.spawnType = this.emitSpawnType.val();

		if(spawnType == "rect")
		{
			output.spawnRect = {
				x: parseFloat(this.emitRectX.val()) || 0,
				y: parseFloat(this.emitRectY.val()) || 0,
				w: parseFloat(this.emitRectW.val()) || 0,
				h: parseFloat(this.emitRectH.val()) || 0
			};
		}
		else if(spawnType == "circle")
		{
			output.spawnCircle = {
				x: parseFloat(this.emitCircleX.val()) || 0,
				y: parseFloat(this.emitCircleY.val()) || 0,
				r: parseFloat(this.emitCircleR.val()) || 0
			};
		}
		else if(spawnType == "burst")
		{
			output.particlesPerWave = parseInt(this.emitParticlesPerWave.val()) || 1;
			output.particleSpacing = parseFloat(this.emitParticleSpacing.val()) || 0;
			output.angleStart = parseFloat(this.emitAngleStart.val()) || 0;
		}
		return output;
	};

	p.getParticleClass = function()
	{
		return this.subclass.val();
	};

	/**
	*  Download the interface config
	*  @method download
	*/
	p.download = function()
	{
		var content = JSON.stringify(this.get(), null, "\t");
		var type = "data:application/json;charset=utf-8";

		var isFileSaverSupported = false;
		try {
			isFileSaverSupported = !!new Blob();
		} catch (e) {}

		if (isFileSaverSupported)
		{
			window.saveAs(
				new Blob([content], {type : type}),
				"emitter.json"
			);
		}
		else
		{
			window.open(encodeURI(type + "," + content));
		}
	};

	// assign to global space
	namespace('pixiparticles').EditorInterface = EditorInterface;

}(jQuery));
(function(){

	// Import library dependencies
	var Texture = include('PIXI.Texture'),
		Sprite = include('PIXI.Sprite'),
		Point = include('PIXI.Point'),
		Graphics = include('PIXI.Graphics'),
		PixiTask = include('springroll.PixiTask'),
		LoadTask = include('springroll.LoadTask'),
		PixiDisplay = include('springroll.PixiDisplay'),
		TaskManager = include('springroll.TaskManager'),
		Emitter = include('cloudkid.Emitter'),
		Application = include('springroll.Application'),
		Loader = include('springroll.Loader'),
		SavedData = include('springroll.SavedData'),
		Browser = include('cloudkid.Browser'),
		EditorInterface = include('pixiparticles.EditorInterface');

	/**
	*  Main logic of the application
	*  @class Editor
	*  @extends springroll.Application
	*  @constructor
	*  @param {object} [options] The application options
	*/
	var Editor = function(options)
	{
		Application.call(this, options);
	};

	// Extend the createjs container
	var p = extend(Editor, Application);

	var stage,
		backgroundSprite,
		emitter,
		emitterContainer,
		emitterEnableTimer = 0,
		particleDefaults = {},
		particleDefaultImages = {},
		particleDefaultImageUrls = {},
		jqImageDiv = null,
		particleCountDiv = null;

	p.init = function()
	{
		this.onMouseIn = this.onMouseIn.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onTexturesLoaded = this.onTexturesLoaded.bind(this);
		this.loadFromUI = this.loadFromUI.bind(this);

		jqImageDiv = $(".particleImage");
		jqImageDiv.remove();

		particleCountDiv = document.getElementById("particleCount");

		var backgroundColor = parseInt(SavedData.read('stageColor') || '999999', 16);

		backgroundSprite = new PIXI.Sprite(PIXI.Texture.fromImage("assets/images/bg.png"));
		backgroundSprite.tint = backgroundColor;

		emitterContainer = new PIXI.DisplayObjectContainer();

		var options = {
			clearView: true,
			backgroundColor: backgroundColor
		};

		// Add webgl renderer
		this.webgl = this.addDisplay("webgl", PixiDisplay, options);
		if(this.webgl.isWebGL)
		{
			options.forceContext = 'canvas2d';

			// Add canvas2d renderer
			this.canvas2d = this.addDisplay("canvas2d", PixiDisplay, options);
		}
		else
		{
			this.canvas2d = this.webgl;
			this.webgl = null;
			document.getElementById("webglRenderer").disabled = true;
			document.getElementById("canvas2dRenderer").checked = true;
		}

		// Default is stage
		this.setRenderer(this.webgl ? "webgl" : "canvas2d");

		Loader.instance.load(
			"assets/config/config.json",
			this.onInitialized.bind(this)
		);

		backgroundSprite.scale.x = 0.1 * this.canvas2d.width;
		backgroundSprite.scale.y = 0.1 * this.canvas2d.height;

		this.on("resize", this.onResize);
	};

	p.onResize = function(w, h)
	{
		backgroundSprite.scale.x = 0.1 * w;
		backgroundSprite.scale.y = 0.1 * h;
	};

	/**
	*  Handler on the configuration load
	*  @method onInitialized
	*  @param {Loader} result
	*/
	p.onInitialized = function(result)
	{
		$("body").removeClass('loading');

		this.config = result.content;
		this.ui = new EditorInterface(this.config.spawnTypes);
		this.ui.refresh.click(this.loadFromUI);
		this.ui.configConfirm.on("click", this.loadConfig.bind(this));
		this.ui.imageConfirm.on("click", this.loadImage.bind(this));

		// Set the starting stage color
		this.ui.stageColor.minicolors("value", SavedData.read('stageColor') || '999999');

		this.ui.on({
			change : this.loadFromUI,
			renderer : this.setRenderer.bind(this),
			stageColor : this.stageColor.bind(this)
		});

		var tasks = [],
			images = [],
			emitterData;

		// Load the emitters
		for (var i = 0; i < this.config.emitters.length; i++)
		{
			emitterData = this.config.emitters[i];
			tasks.push(new LoadTask(emitterData.id, emitterData.config, this.onConfigLoaded));
		}

		// Load the images
		for (var id in this.config.images)
		{
			images.push(this.config.images[id]);
		}

		var customImages;
		// Add any custom images
		try
		{
			customImages = SavedData.read('customImages');
		}
		catch(err){}

		if (customImages)
		{
			for (i = 0; i < customImages.length; i++)
			{
				if (images.indexOf(customImages[i]) == -1)
				{
					images.push(customImages[i]);
				}
			}
		}
		tasks.push(new PixiTask("particle", images, this.onTexturesLoaded));

		TaskManager.process(tasks, this._onCompletedLoad.bind(this));
	};

	/**
	*  Callback for loading the default emitter configuration files
	*  @method onConfigLoaded
	*  @param {LoaderResult} result
	*  @param {LoadTask} task
	*/
	p.onConfigLoaded = function(result, task)
	{
		particleDefaults[task.id] = result.content;
	};

	/**
	*  Callback when an image is loaded
	*  @method onTexturesLoaded
	*/
	p.onTexturesLoaded = function()
	{
		// Load the emitters
		var emitterData,
			image,
			id,
			images = this.config.images;

		for (var i = 0; i < this.config.emitters.length; i++)
		{
			emitterData = this.config.emitters[i];
			id = emitterData.id;

			particleDefaultImageUrls[id] = [];
			particleDefaultImages[id] = [];
			for (var j = 0; j < emitterData.images.length; j++)
			{
				image = emitterData.images[j];
				particleDefaultImageUrls[id].push(images[image]);
				particleDefaultImages[id].push(Texture.fromImage(image));
			}
		}
	};

	/**
	*  When the initial load has completed
	*  @method _onCompletedLoad
	*/
	p._onCompletedLoad = function()
	{
		emitter = new Emitter(emitterContainer);

		var hash = window.location.hash.replace("#", '');

		var config, images;

		try
		{
			config = SavedData.read('customConfig');
			images = SavedData.read('customImages');
		}
		catch(e){}

		if (hash)
		{
			this.loadDefault(hash);
		}
		else if (config && images)
		{
			this.loadSettings(getTexturesFromUrls(images), config);
			this.setConfig(config);

			if (true)
				console.log(images);

			for(var i = 0; i < images.length; ++i)
			{
				this.addImage(images[i]);
			}
		}
		else
		{
			this.loadDefault(this.config.default);
		}

		this.on({
			resize : this._centerEmitter.bind(this),
			update : this.update.bind(this)
		});
	};

	/**
	*  Change the stage color
	*  @method stageColor
	*  @param {String} color
	*/
	p.stageColor = function(color)
	{
		SavedData.write('stageColor', color);
		backgroundSprite.tint = parseInt(color, 16);
	};

	/**
	*  Change the renderer to use
	*  @method setRenderer
	*  @param {String} type Either "webgl" or "canvas2d"
	*/
	p.setRenderer = function(type)
	{
		//if we had to fall back due to not supporting WebGL, then don't do anything dumb
		if(type == 'webgl' && !this.webgl) return;
		// The other stage
		var other = type == 'webgl' ? this.canvas2d : this.webgl;
		if(other)
			other.enabled = other.visible = false;

		// The selected stage
		var display = this[type];

		// Remove old mouse listener
		if (stage)
			stage.mousemove = null;

		stage = display.stage;
		stage.interactionManager.stageIn = this.onMouseIn;
		stage.interactionManager.stageOut = this.onMouseOut;
		stage.mouseup = this.onMouseUp;
		display.enabled = display.visible = true;

		if(backgroundSprite)
		{
			stage.addChild(backgroundSprite);
		}

		if(emitterContainer)
		{
			stage.addChild(emitterContainer);
		}
	};

	/**
	*  Load the default configuration
	*  @method loadDefault
	*  @param {String} name The name of the configuration
	*/
	p.loadDefault = function(name)
	{
		if(!name || !particleDefaultImageUrls[name])
			name = trail;

		window.location.hash = "#" + name;
		this.ui.imageList.children().remove();

		var imageUrls = particleDefaultImageUrls[name];

		for(var i = 0; i < imageUrls.length; ++i)
		{
			this.addImage(imageUrls[i]);
		}
		this.loadSettings(particleDefaultImages[name], particleDefaults[name]);
		this.setConfig(particleDefaults[name]);
	};

	/**
	*  Set the configuration without triggering lots of change events
	*  @method setConfig
	*  @param {object} config
	*/
	p.setConfig = function(config)
	{
		this.ui.off('change');
		this.ui.set(config);
		this.ui.on('change', this.loadFromUI);
	};

	var getTexturesFromUrls = function(urls)
	{
		var images = [];
		for(var i = 0; i < urls.length; ++i)
		{
			images[i] = Texture.fromImage(urls[i]);
		}
		return images;
	};

	/**
	*  Handler for loading the configuration by UI
	*  @method loadConfig
	*  @param {String} type Either default, upload or paste
	*  @param {Event} event Jquery event
	*/
	p.loadConfig = function(event)
	{
		var ui = this.ui, type, value, success = false;

		if(ui.defaultConfigSelector.val() != "-Default Emitters-")
			type = "default";
		else if(ui.configPaste.val())
			type = "paste";
		else if(ui.configUpload[0].files.length > 0)
			type = "upload";

		if (type == "default")
		{
			value = ui.defaultConfigSelector.val();
			if(value != "-Default Emitters-")
			{
				success = true;
				this.loadDefault(value);
			}
		}
		else if (type == "paste")
		{
			value = ui.configPaste.val();
			try
			{
				/* jshint ignore:start */
				eval("var obj = " + elem.val() + ";");
				/* jshint ignore:end */
				success = true;
				this.setConfig(obj);
				this.loadFromUI();
			}
			catch(e) {}
		}
		else if (type == "upload")
		{
			var files = ui.configUpload[0].files;
			var scope = this;
			var onloadend = function(readerObj)
			{
				try
				{
					/* jshint ignore:start */
					eval("var obj = " + readerObj.result + ";");
					/* jshint ignore:end */
					scope.setConfig(obj);
					scope.loadFromUI();
				}
				catch(e){}
			};
			var file = files[0];
			var reader = new FileReader();
			reader.onloadend = onloadend.bind(this, reader);
			reader.readAsText(file);

			success = true;
		}
		if(success)
			ui.configDialog.modal("hide");
	};

	/**
	*  Load image handler
	*  @method loadImage
	*  @param {String} type Either select or upload
	*/
	p.loadImage = function(event)
	{
		var ui = this.ui, type, value, success = false;

		if(ui.defaultImageSelector.val() != "-Default Images-")
			type = "select";
		else if(ui.imageUpload[0].files.length > 0)
			type = "upload";

		if (type == "select")
		{
			value = ui.defaultImageSelector.val();
			if(value != "-Default Images-")
			{
				success = true;
				this.addImage(value);
				this.loadFromUI();
			}
		}
		else if (type == "upload")
		{
			var onloadend = function(readerObj)
			{
				this.addImage(readerObj.result);
				this.loadFromUI();
			};

			var files = ui.imageUpload[0].files;

			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = onloadend.bind(this, reader);
				reader.readAsDataURL(file);
			}

			success = true;
		}
		if(success)
			ui.imageDialog.modal("hide");
	};

	/**
	*  Add an image from a filesource
	*  @method addImage
	*  @param {String} src Image source
	*/
	p.addImage = function(src)
	{
		if (!PIXI.Texture.fromFrame(src, true))
		{
			TaskManager.process(
				[new PixiTask("image", [src], this.onTexturesLoaded)],
				function(){}
			);
		}
		var item = jqImageDiv.clone();
		item.children("img").prop("src", src);
		this.ui.imageList.append(item);

		item.children(".remove").click(removeImage.bind(this));
		item.children(".download").click(downloadImage);
	};

	var downloadImage = function(event)
	{
		var src = $(event.delegateTarget).siblings("img").prop("src");

		if (false)
		{
			window.open(src);
		}

		if (true)
		{
			var path = require('path');
			var fs = require('fs');
			var isDataPath = /^data:image\/png;base64,/.test(src);
			var defaultName = "particle.png";

			if (!isDataPath)
			{
				defaultName = path.basename(src);
			}

			Browser.saveAs(function(output){

				// Copy the src to the target
				if (!isDataPath)
				{
					fs.createReadStream(
						path.resolve(src.replace('file://', ''))
					)
					.pipe(fs.createWriteStream(output));
				}
				else if (isDataPath)
				{
					var base64Data = src.replace(/^data:image\/png;base64,/, "");
					fs.writeFileSync(output, base64Data, 'base64');
				}

			}, defaultName);
		}
	};

	var removeImage = function(event)
	{
		$(event.delegateTarget).parent().remove();
		this.loadFromUI();
	};

	/**
	*  Hnalder when the ui updates
	*  @method loadFromUI
	*/
	p.loadFromUI = function()
	{
		window.location.hash = '';
		var config = this.ui.get();
		var images = this.getTexturesFromImageList();
		var particleClass = this.getParticleClass();
		SavedData.write('customConfig', config);
		this.loadSettings(images, config, particleClass);
	};

	p.getParticleClass = function()
	{
		var type = this.ui.getParticleClass();
		switch(type)
		{
			case "path":
				return cloudkid.PathParticle;
			case "anim":
				return cloudkid.AnimatedParticle;
			default:
				return cloudkid.Particle;
		}
	};

	/**
	*  Get the texture from the images list
	*  @method getTexturesFromImageList
	*/
	p.getTexturesFromImageList = function()
	{
		var images = [];
		var children = this.ui.imageList.find("img");

		if (children.length === 0) return null;

		var self = this;
		children.each(function() {
			images.push(this.src);
		});

		// Save the current image sources
		SavedData.write('customImages', images);

		return getTexturesFromUrls(images);
	};

	/**
	*  Load the settings
	*  @method loadSettings
	*  @param {array} images The collection of images
	*  @param {object} config The emitter configuration
	*  @param {Function} particleClass The particle class to use for the emitter.
	*/
	p.loadSettings = function(images, config, particleClass)
	{
		if (!emitter) return;

		emitter.init(images, config);
		if(!particleClass)
			particleClass = cloudkid.Particle;
		emitter.particleConstructor = particleClass;
		this._centerEmitter();
		emitterEnableTimer = 0;
	};

	/**
	*  Frame update
	*  @method update
	*  @param {int} elapsed Milliseconds since last update
	*/
	p.update = function(elapsed)
	{
		if (!emitter) return;

		emitter.update(elapsed * 0.001);

		if(!emitter.emit && emitterEnableTimer <= 0)
		{
			emitterEnableTimer = 1000 + emitter.maxLifetime * 1000;
		}
		else if(emitterEnableTimer > 0)
		{
			emitterEnableTimer -= elapsed;
			if(emitterEnableTimer <= 0)
				emitter.emit = true;
		}

		particleCountDiv.innerHTML = emitter._activeParticles.length + " Particles";
	};

	p.onMouseUp = function()
	{
		if (!emitter) return;

		emitter.resetPositionTracking();
		emitter.emit = true;
		emitterEnableTimer = 0;
	};

	p.onMouseIn = function()
	{
		if (!emitter) return;

		stage.mousemove = this.onMouseMove;
		emitter.resetPositionTracking();
	};

	p._centerEmitter = function()
	{
		if (!emitter || !emitter.ownerPos) return;

		emitter.updateOwnerPos(
			this.display.canvas.width / 2,
			this.display.canvas.height / 2
		);
	};

	p.onMouseOut = function()
	{
		if (!emitter) return;

		stage.mousemove = null;
		this._centerEmitter();
		emitter.resetPositionTracking();
	};

	p.onMouseMove = function(data)
	{
		if (!emitter) return;

		emitter.updateOwnerPos(data.global.x, data.global.y);
	};

	namespace('pixiparticles').Editor = Editor;

}());
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
			debug: true,
			resizeElement: "content",
			uniformResize: false
		});
		
		if (true)
		{
			/**
			*  Add the new menu
			*  @property {pixiparticles.Menu} menu
			*/
			this.menu = new Menu();
		}

		// Add Google Analytics for the web view only
		if (false)
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
//# sourceMappingURL=main.js.map