(function(){
		
	// Import library dependencies
	var Texture = include('PIXI.Texture'),
		Sprite = include('PIXI.Sprite'),
		Point = include('PIXI.Point'),
		Graphics = include('PIXI.Graphics'),
		PixiTask = include('cloudkid.PixiTask'),
		LoadTask = include('cloudkid.LoadTask'),
		PixiDisplay = include('cloudkid.PixiDisplay'),
		TaskManager = include('cloudkid.TaskManager'),
		Emitter = include('cloudkid.Emitter'),
		Application = include('cloudkid.Application'),
		Loader = include('cloudkid.Loader'),
		SavedData = include('cloudkid.SavedData'),
		EditorInterface = include('pixiparticles.EditorInterface');
	
	/**
	*  Main logic of the application
	*  @class Editor
	*  @extends cloudkid.Application
	*  @constructor
	*  @param {object} [options] The application options
	*/
	var Editor = function(options)
	{
		Application.call(this, options);
	};
	
	// Extend the createjs container
	var p = Editor.prototype = Object.create(Application.prototype);
	
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
			backgroundColor: backgroundColor//,
			//forceContext: "webgl"
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
		this.ui.defaultImageSelector.on("selectmenuselect", this.loadImage.bind(this, "select"));
		this.ui.imageUpload.change(this.loadImage.bind(this, "upload"));
		this.ui.defaultConfigSelector.on("selectmenuselect", this.loadConfig.bind(this, "default"));
		this.ui.configUpload.change(this.loadConfig.bind(this, "upload"));
		this.ui.configPaste.on('paste', this.loadConfig.bind(this, "paste"));

		// Set the starting stage color
		//this.ui.stageColor.colorpicker('setColor', SavedData.read('stageColor') || '999999');

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

		// Save the current custom images
		SavedData.write('customImages', imageUrls);

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
	p.loadConfig = function(type, event)
	{
		var ui = this.ui;
		if (type == "default")
		{
			var value = ui.defaultConfigSelector.val();
			if(value == "-Default Emitters-")
				return;
			this.loadDefault(value);
			ui.configDialog.dialog("close");
		}
		else if (type == "paste")
		{
			var elem = ui.configPaste;
			setTimeout(function()
			{
				try	{
					/* jshint ignore:start */
					eval("var obj = " + elem.val() + ";");
					/* jshint ignore:end */
					this.setConfig(obj);
					this.loadFromUI();
				}
				catch(e){}
				ui.configDialog.dialog("close");//close the dialog after the delay
			}.bind(this), 10);
		}
		else if (type == "upload")
		{
			var files = event.originalEvent.target.files;
			var scope = this;
			var onloadend = function(readerObj)
			{
				try {
					/* jshint ignore:start */
					eval("var obj = " + readerObj.result + ";");
					/* jshint ignore:end */
					scope.setConfig(obj);
					scope.loadFromUI();
				}
				catch(e){}
			};
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = onloadend.bind(this, reader);
				reader.readAsText(file);
			}
			ui.configDialog.dialog("close");
		}
	};

	/**
	*  Load image handler
	*  @method loadImage
	*  @param {String} type Either select or upload
	*/
	p.loadImage = function(type, event)
	{
		if (type == "select")
		{
			var value = this.ui.defaultImageSelector.val();
			if(value == "-Default Images-") return;
			this.addImage(value);
			this.loadFromUI();
		}
		else if (type == "upload")
		{
			var files = event.originalEvent.target.files;
			
			var onloadend = function(readerObj)
			{
				this.addImage(readerObj.result);
				this.loadFromUI();
			};

			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = onloadend.bind(this, reader);
				reader.readAsDataURL(file);
			}
		}
		this.ui.imageDialog.dialog("close");
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

		item.children(".remove").button(
			{icons:{primary:"ui-icon-close"}, text:false}
		).click(removeImage.bind(this));

		item.children(".download").button(
			{icons:{primary:"ui-icon-arrowthickstop-1-s"}, text:false}
		).click(downloadImage);
	};

	var downloadImage = function(event)
	{
		var src = $(event.delegateTarget).siblings("img").prop("src");
		window.open(src);
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
		SavedData.write('customConfig', config);
		this.loadSettings(images, config);
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
	*/
	p.loadSettings = function(images, config)
	{
		if (!emitter) return;

		console.log(images);
		console.log(config);
		
		emitter.init(images, config);
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