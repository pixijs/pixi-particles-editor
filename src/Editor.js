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
		EditorInterface = include('cloudkid.EditorInterface');
	
	var Editor = function(options)
	{
		Application.call(this, options);
	};
	
	// Extend the createjs container
	var p = Editor.prototype = Object.create(Application.prototype);
	
	var stage, 
		emitter,
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

		jqImageDiv = $(".particleImage");
		jqImageDiv.remove();

		particleCountDiv = document.getElementById("particleCount");

		var backgroundColor = parseInt(SavedData.read('stageColor') || '999999', 16);

		var options = {
			clearView: true,
			backgroundColor: backgroundColor,
			forceContext: "webgl"
		};

		// Add webgl renderer
		this.webgl = this.addDisplay("webgl", PixiDisplay, options);
		options.forceContext = 'canvas2d';

		// Add canvas2d renderer
		this.canvas2d = this.addDisplay("canvas2d", PixiDisplay, options);

		// Default is stage
		this.setRenderer("webgl");

		Loader.instance.load(
			"assets/config/config.json", 
			this.onInitialized.bind(this)
		);
	};

	p.onInitialized = function(result)
	{
		$("body").removeClass('loading');

		this.config = result.content;
		this.ui = new EditorInterface(this.config.spawnTypes)
			.on({
				change : this.loadFromUI.bind(this),
				renderer : this.setRenderer.bind(this),
				stageColor : this.stageColor.bind(this)
			});

		// Set the color
		this.ui.stageColor.colorpicker('setColor', SavedData.read('stageColor') || '999999');

		var tasks = [],
			images = [],
			emitter;

		// Load the emitters
		for (var i = 0; i < this.config.emitters.length; i++)
		{
			emitter = this.config.emitters[i];
			tasks.push(new LoadTask(emitter.id, emitter.config, this.onConfigLoaded));
		}

		// Load the images
		for (var id in this.config.images)
		{
			images.push(this.config.images[id]);
		}
		tasks.push(new PixiTask("particle", images, this.onTexturesLoaded.bind(this)));
		
		TaskManager.process(tasks, this._onCompletedLoad.bind(this));
	};

	p.onConfigLoaded = function(result, task)
	{
		particleDefaults[task.id] = result.content;
	};

	p.onTexturesLoaded = function()
	{
		// Load the emitters
		var emitter,
			image,
			id,
			images = this.config.images;
		for (var i = 0; i < this.config.emitters.length; i++)
		{
			emitter = this.config.emitters[i];
			id = emitter.id;

			particleDefaultImageUrls[id] = [];
			particleDefaultImages[id] = [];
			for (var j = 0; j < emitter.images.length; j++)
			{
				image = emitter.images[j];
				particleDefaultImageUrls[id].push(images[image]);
				particleDefaultImages[id].push(PIXI.Texture.fromImage(image));
			}
		}
	};
	
	/**
	*  When the initial load has completed
	*  @method _onCompletedLoad
	*/
	p._onCompletedLoad = function()
	{
		this.ui.refresh.click(this.loadFromUI.bind(this));
		this.ui.defaultImageSelector.on("selectmenuselect", this.loadImage.bind(this, "select"));
		this.ui.imageUpload.change(this.loadImage.bind(this, "upload"));
		this.ui.defaultConfigSelector.on("selectmenuselect", this.loadConfig.bind(this, "default"));
		this.ui.configUpload.change(this.loadConfig.bind(this, "upload"));
		this.ui.configPaste.on('paste', this.loadConfig.bind(this, "paste"));

		emitter = new Emitter(stage);

		var hash = window.location.hash.replace("#", '');
		this.loadDefault(hash || this.config.default);

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
		this.webgl.stage.setBackgroundColor(parseInt(color, 16));
		this.canvas2d.stage.setBackgroundColor(parseInt(color, 16));
	};

	/**
	*  Change the renderer to use
	*  @method setRenderer
	*  @param {String} type Either "webgl" or "canvas2d"
	*/
	p.setRenderer = function(type)
	{
		// The other stage
		var other = type == 'webgl' ? this.canvas2d : this.webgl;
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
		
		if (emitter)
		{
			emitter.parent = stage;
		}
	};

	p.loadDefault = function(name)
	{
		if(!name)
			name = trail;

		window.location.hash = "#" + name;

		this.ui.imageList.children().remove();

		var imageUrls = particleDefaultImageUrls[name];
		for(var i = 0; i < imageUrls.length; ++i)
			this.addImage(imageUrls[i]);
		this.loadSettings(particleDefaultImages[name], particleDefaults[name]);
		this.ui.set(particleDefaults[name]);
	};

	p.loadConfig = function(type, event)
	{
		var ui = this.ui;
		if(type == "default")
		{
			var value = ui.defaultConfigSelector.val();
			if(value == "-Default Emitters-")
				return;
			this.loadDefault(value);
			ui.configDialog.dialog("close");
		}
		else if(type == "paste")
		{
			var elem = ui.configPaste;
			setTimeout(function()
			{
				try	{
					/* jshint ignore:start */
					eval("var obj = " + elem.val() + ";");
					/* jshint ignore:end */
					ui.set(obj);
				}
				catch(e){}
				ui.configDialog.dialog("close");//close the dialog after the delay
			}.bind(this), 10);
		}
		else if(type == "upload")
		{
			var files = event.originalEvent.target.files;
			var onloadend = function(readerObj)
			{
				try {
					/* jshint ignore:start */
					eval("var obj = " + readerObj.result + ";");
					/* jshint ignore:end */
					ui.set(obj);
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

	p.loadImage = function(type, event)
	{
		if(type == "select")
		{
			var value = this.ui.defaultImageSelector.val();
			if(value == "-Default Images-")
				return;
			this.addImage(value);
		}
		else if(type == "upload")
		{
			var files = event.originalEvent.target.files;
			
			var onloadend = function(readerObj)
			{
				this.addImage(readerObj.result);
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

	p.addImage = function(src)
	{
		if(!PIXI.Texture.fromFrame(src, true))
		{
			var tasks = [
				new PixiTask("image", [src], this.onTexturesLoaded)
			];
			TaskManager.process(tasks, function(){});
		}
		var item = jqImageDiv.clone();
		item.children("img").prop("src", src);
		this.ui.imageList.append(item);

		item.children(".remove").button(
			{icons:{primary:"ui-icon-close"}, text:false}
		).click(removeImage);

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
	};

	p.loadFromUI = function()
	{
		this.loadSettings(
			this.getTexturesFromImageList(), 
			this.ui.get()
		);
	};

	p.getTexturesFromImageList = function()
	{
		var images = [];
		var children = this.ui.imageList.find("img");
		if(children.length === 0)
			return null;
		children.each(function() { images.push($(this).prop("src")); });
		for(var i = 0; i < images.length; ++i)
		{
			images[i] = PIXI.Texture.fromImage(images[i]);
		}
		return images;
	};

	p.loadSettings = function(images, config)
	{
		if (!emitter) return;

		emitter.init(images, config);
		this._centerEmitter();
		emitterEnableTimer = 0;
	};

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
		if (!emitter) return;

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
	
	namespace('cloudkid').Editor = Editor;
	
}());