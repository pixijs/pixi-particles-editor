(function(){
		
	// Import library dependencies
	var Texture = PIXI.Texture,
		Sprite = PIXI.Sprite,
		Point = PIXI.Point,
		Graphics = PIXI.Graphics,
		PixiTask = cloudkid.PixiTask,
		LoadTask = cloudkid.LoadTask,
		TaskManager = cloudkid.TaskManager,
		Emitter = cloudkid.Emitter,
		Application = cloudkid.Application,
		MediaLoader = cloudkid.MediaLoader,
		EditorInterface = cloudkid.EditorInterface;
	
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

		stage = this.display.stage;
		
		MediaLoader.instance.load(
			"assets/config/config.json", 
			this.onInitialized.bind(this)
		);
	};

	p.onInitialized = function(result)
	{
		$("body").removeClass('loading');

		this.config = result.content;
		this.ui = new EditorInterface(this.config.spawnTypes);
		this.ui.on('change', this.loadFromUI.bind(this));

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
	
	p._onCompletedLoad = function()
	{
		stage.interactionManager.stageIn = this.onMouseIn;
		stage.interactionManager.stageOut = this.onMouseOut;
		stage.mouseup = this.onMouseUp;

		this.ui.refresh.click(this.loadFromUI.bind(this));
		this.ui.defaultImageSelector.on("selectmenuselect", this.loadImage.bind(this, "select"));
		this.ui.imageUpload.change(this.loadImage.bind(this, "upload"));
		this.ui.defaultConfigSelector.on("selectmenuselect", this.loadConfig.bind(this, "default"));
		this.ui.configUpload.change(this.loadConfig.bind(this, "upload"));
		this.ui.configPaste.on('paste', this.loadConfig.bind(this, "paste"));

		emitter = new Emitter(stage);

		var hash = window.location.hash.replace("#", '');
		this.loadDefault(hash || this.config.default);

		this.on('resize', this._centerEmitter.bind(this))
			.on("update", this.update.bind(this));
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
		emitter.init(images, config);
		this._centerEmitter();
		emitterEnableTimer = 0;
	};

	p.update = function(elapsed)
	{
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
		emitter.resetPositionTracking();
		emitter.emit = true;
		emitterEnableTimer = 0;
	};

	p.onMouseIn = function()
	{
		stage.mousemove = this.onMouseMove;
		emitter.resetPositionTracking();
	};

	p._centerEmitter = function()
	{
		emitter.updateOwnerPos(
			this.display.canvas.width / 2, 
			this.display.canvas.height / 2
		);
	};

	p.onMouseOut = function()
	{
		stage.mousemove = null;
		this._centerEmitter();
		emitter.resetPositionTracking();
	};

	p.onMouseMove = function(data)
	{
		emitter.updateOwnerPos(data.global.x, data.global.y);
	};
	
	namespace('cloudkid').Editor = Editor;
	
}());