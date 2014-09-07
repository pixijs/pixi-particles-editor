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
		Application = cloudkid.Application;
	
	var Editor = function(options)
	{
		Application.call(this, options);
	};
	
	// Extend the createjs container
	var p = Editor.prototype = Object.create(Application.prototype);
	
	var stage;

	var emitter;
	var emitterEnableTimer = 0;

	var particleDefaults;
	var particleDefaultImages;

	var defaultTexture = "particle.png";
	var defaultNames = ["trail", "flame", "gas", "explosion", "explosion2", "megamanDeath", "rain"];
	var defaultImages = ["assets/images/particle.png", "assets/images/smokeparticle.png", "assets/images/rain.png"];
	
	p.spawnTypes = ["point", "circle", "rect", "burst"];

	var jqImageDiv = null;
	
	p.init = function()
	{
		this.onMouseIn = this.onMouseIn.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		jqImageDiv = $(".particleImage");
		jqImageDiv.remove();

		stage = this.display.stage;

		particleDefaults = {};
		particleDefaultImages = {};
		particleDefaultImageUrls = {};

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
		$("#downloadConfig").click(this.downloadConfig.bind(this));
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
		this.updateUI(particleDefaults[name]);
	};

	p.updateUI = function(config)
	{
		//particle settings
		$("#alphaStart").slider("value", config.alpha ? config.alpha.start : 1);
		$("#alphaEnd").slider("value", config.alpha ? config.alpha.end : 1);
		$("#scaleStart").spinner("value", config.scale ? config.scale.start : 1);
		$("#scaleEnd").spinner("value", config.scale ? config.scale.end : 1);
		$("#colorStart").colorpicker("setColor", config.color ? config.color.start : "FFFFFF");
		$("#colorEnd").colorpicker("setColor", config.color ? config.color.end : "FFFFFF");
		$("#speedStart").spinner("value", config.speed ? config.speed.start : 0);
		$("#speedEnd").spinner("value", config.speed ? config.speed.end : 0);
		$("#startRotationMin").spinner("value", config.startRotation ? config.startRotation.min : 0);
		$("#startRotationMax").spinner("value", config.startRotation ? config.startRotation.max : 0);
		$("#rotationSpeedMin").spinner("value", config.rotationSpeed ? config.rotationSpeed.min : 0);
		$("#rotationSpeedMax").spinner("value", config.rotationSpeed ? config.rotationSpeed.max : 0);
		$("#lifeMin").spinner("value", config.lifetime ? config.lifetime.min : 1);
		$("#lifeMax").spinner("value", config.lifetime ? config.lifetime.max : 1);
		$("#customEase").val(config.ease ? JSON.stringify(config.ease) : "");
		//emitter settings
		$("#emitFrequency").spinner("value", config.frequency || 0.5);
		$("#emitLifetime").spinner("value", config.emitterLifetime || -1);
		$("#emitMaxParticles").spinner("value", config.maxParticles || 1000);
		$("#emitSpawnPosX").spinner("value", config.pos ? config.pos.x : 0);
		$("#emitSpawnPosY").spinner("value", config.pos ? config.pos.y : 0);
		$("#emitAddAtBack").prop("checked", !!config.addAtBack);
		//spawn type
		var spawnType = config.spawnType, spawnTypes = this.spawnTypes;
		if(spawnTypes.indexOf(spawnType) == -1)
			spawnType = spawnTypes[0];
		//update dropdown
		$("#emitSpawnType").val(spawnType);
		$("#emitSpawnType").selectmenu("refresh");
		//hide non-type options
		for(var i = 0; i < spawnTypes.length; ++i)
		{
			if(spawnTypes[i] == spawnType)
				$(".settings-" + spawnTypes[i]).show();
			else
				$(".settings-" + spawnTypes[i]).hide();
		}
		//set or reset these options
		$("#emitRectX").spinner("value", config.spawnRect ? config.spawnRect.x : 0);
		$("#emitRectY").spinner("value", config.spawnRect ? config.spawnRect.y : 0);
		$("#emitRectW").spinner("value", config.spawnRect ? config.spawnRect.w : 0);
		$("#emitRectH").spinner("value", config.spawnRect ? config.spawnRect.h : 0);
		$("#emitCircleX").spinner("value", config.spawnCircle ? config.spawnCircle.x : 0);
		$("#emitCircleY").spinner("value", config.spawnCircle ? config.spawnCircle.y : 0);
		$("#emitCircleR").spinner("value", config.spawnCircle ? config.spawnCircle.R : 0);
		$("#emitParticlesPerWave").spinner("value", config.particlesPerWave > 0 ? config.particlesPerWave : 1);
		$("#emitParticleSpacing").spinner("value", config.particleSpacing ? config.particleSpacing : 0);
		$("#emitAngleStart").spinner("value", config.angleStart ? config.angleStart : 0);
	};

	p.loadConfig = function(type, event, ui)
	{
		if(type == "default")
		{
			var value = $("#defaultConfigSelector option:selected").text();
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
					this.updateUI(obj);
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
					this.updateUI(obj);
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
			var value = $("#defaultImageSelector option:selected").text();
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
		item.children(".remove").button({icons:{primary:"ui-icon-close"}, text:false}).click(removeImage);
		item.children(".download").button({icons:{primary:"ui-icon-arrowthickstop-1-s"}, text:false}).click(downloadImage);
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

	p.generateConfig = function()
	{
		var output = {};
		
		//particle settings
		output.alpha = {start: $("#alphaStart").slider("value"), end: $("#alphaEnd").slider("value")};
		output.scale = {start: $("#scaleStart").spinner("value"), end: $("#scaleEnd").spinner("value")};
		output.color = {start: $("#colorStart").val(), end: $("#colorEnd").val()};
		output.speed = {start: $("#speedStart").spinner("value"), end: $("#speedEnd").spinner("value")};
		output.startRotation = {min: $("#startRotationMin").spinner("value"), max: $("#startRotationMax").spinner("value")};
		output.rotationSpeed = {min: $("#rotationSpeedMin").spinner("value"), max: $("#rotationSpeedMax").spinner("value")};
		output.lifetime = {min: $("#lifeMin").spinner("value"), max: $("#lifeMax").spinner("value")};
		var val = $("#customEase").val();
		if(val)
		{
			try{
				/* jshint ignore:start */
				eval("val = " + val + ";");
				/* jshint ignore:end */
				if(val && typeof val != "string")
					output.ease = val;
			}
			catch(e)
			{
			}
		}
		//emitter settings
		output.frequency = $("#emitFrequency").spinner("value");
		output.emitterLifetime = $("#emitLifetime").spinner("value");
		output.maxParticles = $("#emitMaxParticles").spinner("value");
		output.pos = {x: $("#emitSpawnPosX").spinner("value"), y: $("#emitSpawnPosY").spinner("value")};
		output.addAtBack = $("#emitAddAtBack").prop("checked");
		//spawn type stuff
		var spawnType = output.spawnType = $("#emitSpawnType option:selected").val();
		if(spawnType == "rect")
			output.spawnRect = {x: $("#emitRectX").spinner("value"), y: $("#emitRectY").spinner("value"),
								w: $("#emitRectW").spinner("value"), h: $("#emitRectH").spinner("value")};
		else if(spawnType == "circle")
			output.spawnCircle = {x: $("#emitCircleX").spinner("value"), y: $("#emitCircleY").spinner("value"),
								r: $("#emitCircleR").spinner("value")};
		else if(spawnType == "burst")
		{
			output.particlesPerWave = $("#emitParticlesPerWave").spinner("value");
			output.particleSpacing = $("#emitParticleSpacing").spinner("value");
			output.angleStart = $("#emitAngleStart").spinner("value");
		}
		return output;
	};

	p.downloadConfig = function()
	{
		//could use "data:application/octet-stream;charset=utf-8,", but it just names the file "download"
		//by merely opening it, the download can be named in the save dialog
		var exportData = "data:text/json;charset=utf-8,";
		exportData += JSON.stringify(this.generateConfig(), null, "\t");
		var encodedUri = encodeURI(exportData);
		window.open(encodedUri);
	};

	p.loadFromUI = function()
	{
		this.loadSettings(this.getTexturesFromImageList(), this.generateConfig());
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