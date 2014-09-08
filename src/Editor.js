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
		particleDefaultImageUrls = {};

	var defaultNames = ["trail", "flame", "gas", "explosion", "explosion2", "megamanDeath", "rain"];
	var defaultImages = ["assets/images/particle.png", "assets/images/smokeparticle.png", "assets/images/rain.png"];
	
	var jqImageDiv = null;
	
	p.init = function()
	{
		this.ui = new EditorInterface(["point", "circle", "rect", "burst"]);

		this.onMouseIn = this.onMouseIn.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		jqImageDiv = $(".particleImage");
		jqImageDiv.remove();

		stage = this.display.stage;
		
		var tasks = [
			new LoadTask("trail", "assets/config/defaultTrail.json", this.onConfigLoaded),
			new LoadTask("flame", "assets/config/defaultFlame.json", this.onConfigLoaded),
			new LoadTask("gas", "assets/config/defaultGas.json", this.onConfigLoaded),
			new LoadTask("explosion", "assets/config/explosion.json", this.onConfigLoaded),
			new LoadTask("explosion2", "assets/config/explosion2.json", this.onConfigLoaded),
			new LoadTask("megamanDeath", "assets/config/megamanDeath.json", this.onConfigLoaded),
			new LoadTask("rain", "assets/config/rain.json", this.onConfigLoaded),
			new PixiTask("particle", [
					"assets/images/particle.png", 
					"assets/images/smokeparticle.png", 
					"assets/images/rain.png"
				], this.onTexturesLoaded)
		];
		
		TaskManager.process(tasks, this._onCompletedLoad.bind(this));
	};

	p.onConfigLoaded = function(result, task)
	{
		particleDefaults[task.id] = result.content;
	};

	p.onTexturesLoaded = function()
	{
		particleDefaultImageUrls.trail = ["assets/images/particle.png"];
		particleDefaultImages.trail = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls.flame = ["assets/images/particle.png"];
		particleDefaultImages.flame = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls.gas = ["assets/images/smokeparticle.png"];
		particleDefaultImages.gas = [PIXI.Texture.fromImage("smokeparticle")];
		particleDefaultImageUrls.explosion = ["assets/images/particle.png"];
		particleDefaultImages.explosion = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls.explosion2 = ["assets/images/particle.png"];
		particleDefaultImages.explosion2 = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls.megamanDeath = ["assets/images/particle.png"];
		particleDefaultImages.megamanDeath = [PIXI.Texture.fromImage("particle")];
		particleDefaultImageUrls.rain = ["assets/images/rain.png"];
		particleDefaultImages.rain = [PIXI.Texture.fromImage("rain")];
	};
	
	p._onCompletedLoad = function()
	{
		stage.interactionManager.stageIn = this.onMouseIn;
		stage.interactionManager.stageOut = this.onMouseOut;
		this.on("update", this.update.bind(this));

		$("#refresh").click(this.loadFromUI.bind(this));

		$("#defaultImageSelector").on("selectmenuselect", this.loadImage.bind(this, "select"));
		$("#imageUpload").change(this.loadImage.bind(this, "upload"));
		$("#defaultConfigSelector").on("selectmenuselect", this.loadConfig.bind(this, "default"));
		$("#configUpload").change(this.loadConfig.bind(this, "upload"));
		$("#configPaste").on('paste', this.loadConfig.bind(this, "paste"));

		emitter = new Emitter(stage);

		this.loadDefault("trail");

		this.on('resize', this._centerEmitter.bind(this));
	};

	p.loadDefault = function(name)
	{
		if(!name)
			name = trail;

		$("#imageList").children().remove();
		var imageUrls = particleDefaultImageUrls[name];
		for(var i = 0; i < imageUrls.length; ++i)
			this.addImage(imageUrls[i]);
		this.loadSettings(particleDefaultImages[name], particleDefaults[name]);
		this.ui.set(particleDefaults[name]);
	};

	p.loadConfig = function(type, event, ui)
	{
		if(type == "default")
		{
			var value = $("#defaultConfigSelector").val();
			if(value == "-Default Emitters-")
				return;
			this.loadDefault(value);
			$("#configDialog").dialog("close");
		}
		else if(type == "paste")
		{
			var elem = $("#configPaste");
			setTimeout(function()
			{
				try
				{
					/* jshint ignore:start */
					eval("var obj = " + elem.val() + ";");
					/* jshint ignore:end */
					this.ui.set(obj);
				}
				catch(e)
				{
				}
				$("#configDialog").dialog("close");//close the dialog after the delay
			}.bind(this), 10);
		}
		else if(type == "upload")
		{
			var files = event.originalEvent.target.files;
			var onloadend = function(readerObj)
			{
				try
				{
					/* jshint ignore:start */
					eval("var obj = " + readerObj.result + ";");
					/* jshint ignore:end */
					this.ui.set(obj);
				}
				catch(e)
				{
				}
			};
			for (var i = 0; i < files.length; i++)
			{
				var file = files[i];
				var reader = new FileReader();
				reader.onloadend = onloadend.bind(this, reader);
				reader.readAsText(file);
			}
			$("#configDialog").dialog("close");
		}
	};

	p.loadImage = function(type, event, ui)
	{
		if(type == "select")
		{
			var value = $("#defaultImageSelector").val();
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
		$("#imageDialog").dialog("close");
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
		$("#imageList").append(item);

		item.children(".remove").button(
			{icons:{primary:"ui-icon-close"}, text:false}
		).click(removeImage);

		item.children(".download").button(
			{icons:{primary:"ui-icon-arrowthickstop-1-s"}, text:false}
		).click(downloadImage);
	};

	var downloadImage = function(event, ui)
	{
		var src = $(event.delegateTarget).siblings("img").prop("src");
		window.open(src);
	};

	var removeImage = function(event, ui)
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
		var children = $("#imageList").find("img");
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