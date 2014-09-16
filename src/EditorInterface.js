(function($){

	var EventDispatcher = include('cloudkid.EventDispatcher');

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
			"colorStart",
			"colorEnd",
			"speedStart",
			"speedEnd",
			"startRotationMin",
			"startRotationMax",
			"rotationSpeedMin",
			"rotationSpeedMax",
			"lifeMin",
			"lifeMax",
			"blendMode",
			"customEase",
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

	var p = EditorInterface.prototype = Object.create(EventDispatcher.prototype);

	p.changed = function()
	{
		this.trigger('change');
	};

	p.init = function()
	{
		var self = this;
		var app = cloudkid.Application.instance;
		var changed = this.changed.bind(this);

		//enable tooltips for any element with a title attribute
		//$(document).tooltip();

		//enable the buttons at the top
		this.refresh.button({icons:{primary:"ui-icon-arrowrefresh-1-s"}});
		this.loadConfig.button({icons:{primary:"ui-icon-folder-open"}});

		//$("#clipboard").button({icons:{primary:"ui-icon-copy"}});
		this.downloadConfig.button({icons:{primary:"ui-icon-arrowthickstop-1-s"}});

		//enable all unit sliders (0-1)
		$(".unitSlider").slider({
			animate: "fast",
			min: 0,
			max: 1,
			step: 0.01
		}).on('slidechange slidestop', changed);

		//set up all sliders to change their text input when they slide or
		//or are changed externally
		var sliders = $(".slider");
		sliders.on("slide slidechange", function(event, ui) {
			$(this).children("input").val(ui.value);
		}).on('slidechange slidestop', changed);

		//set up all sliders to get changed by their text inputs
		//this also changes the text input, which clamps values in the sliders
		$(".slider input").change(function() {
			$(this).parent().slider("value", $(this).val().replace(/[^0-9.]+/,""));
			changed();
		});

		//set up all spinners that can't go negative
		$(".positiveSpinner").spinner({
			min: 0,
			numberFormat: "n",
			step: 0.01
		}).on('spinchange spinstop', changed);

		//set up all spinners that can't go negative
		$(".frequencySpinner").spinner({
			min: 0,
			numberFormat: "n",
			step: 0.001
		}).on('spinchange spinstop', changed);

		//set up general spinners
		$(".generalSpinner").spinner({
			numberFormat: "n",
			step: 0.1
		}).on('spinchange spinstop', changed);

		//set up integer spinners
		$(".posIntSpinner").spinner({
			min: 1,
			step: 1
		}).on('spinchange spinstop', changed);

		//enable color pickers
		$(".colorPicker").colorpicker({
			parts: ["header", "map", "bar", "hsv", "rgb", "hex", "preview", "footer"],
			showOn: "both",
			buttonColorize: true,
			okOnEnter: true,
			revert: true,
			mode: "h",
			buttonImage: "assets/js/colorpicker/images/ui-colorpicker.png",
			select: changed
		});

		this.renderer.buttonset().find('input').change(function(){
			self.trigger('renderer', this.value);
			changed();
		});

		//enable blend mode selector
		this.blendMode.selectmenu().on('selectmenuchange', changed);

		//enable image upload dialog
		this.addImage
			.button()
			.click(function(event) {
				self.defaultImageSelector.find("option:contains('-Default Images-')").prop("selected",true);
				self.defaultImageSelector.selectmenu("refresh");
				self.imageUpload.wrap('<form>').parent('form').trigger('reset');
				self.imageUpload.unwrap();
				self.imageDialog.dialog("open");
				event.preventDefault();
			});

		this.imageDialog.dialog({
			autoOpen: false,
			width: 400,
			buttons: [
				{
					text: "Cancel",
					click: function() {
						$(this).dialog( "close" );
					}
				}
			]
		});

		this.defaultImageSelector.selectmenu();

		//enable config upload dialog
		this.loadConfig.click(function(event) {
			self.defaultConfigSelector
				.find("option:contains('-Default Emitters-')")
				.prop("selected",true);
			self.defaultConfigSelector.selectmenu("refresh");
			self.configUpload.wrap('<form>').parent('form').trigger('reset');
			self.configUpload.unwrap();
			self.configPaste.val("");
			self.configDialog.dialog("open");
			event.preventDefault();
		});

		this.configDialog.dialog({
			autoOpen: false,
			width: 400,
			buttons: [
				{
					text: "Cancel",
					click: function() {
						$(this).dialog( "close" );
					}
				}
			]
		});

		this.defaultConfigSelector.selectmenu();

		var spawnTypes = this.spawnTypes;

		//enable spawn type stuff
		this.emitSpawnType.selectmenu({
			select: function(event, ui)
			{
				var value = self.emitSpawnType.val();
				for(var i = 0; i < spawnTypes.length; ++i)
				{
					if(spawnTypes[i] == value)
						$(".settings-" + spawnTypes[i]).show();
					else
						$(".settings-" + spawnTypes[i]).hide();
				}
			}
		}).on('selectmenuchange', changed);

		// Update the background color
		this.stageColor.colorpicker({
			select : function(e, data)
			{
				self.trigger('stageColor', data.formatted);
			}
		});

		//this.stageColor.colorpicker("setColor", stageColor);
	};

	/**
	*  Set the interface to the config
	*  @method set
	*  @param {object} config The emitter configuration setting
	*/
	p.set = function(config)
	{
		//particle settings
		this.alphaStart.slider("value", config.alpha ? config.alpha.start : 1);
		this.alphaEnd.slider("value", config.alpha ? config.alpha.end : 1);
		this.scaleStart.spinner("value", config.scale ? config.scale.start : 1);
		this.scaleEnd.spinner("value", config.scale ? config.scale.end : 1);
		this.colorStart.colorpicker("setColor", config.color ? config.color.start : "FFFFFF");
		this.colorEnd.colorpicker("setColor", config.color ? config.color.end : "FFFFFF");
		this.speedStart.spinner("value", config.speed ? config.speed.start : 0);
		this.speedEnd.spinner("value", config.speed ? config.speed.end : 0);
		this.startRotationMin.spinner("value", config.startRotation ? config.startRotation.min : 0);
		this.startRotationMax.spinner("value", config.startRotation ? config.startRotation.max : 0);
		this.rotationSpeedMin.spinner("value", config.rotationSpeed ? config.rotationSpeed.min : 0);
		this.rotationSpeedMax.spinner("value", config.rotationSpeed ? config.rotationSpeed.max : 0);
		this.lifeMin.spinner("value", config.lifetime ? config.lifetime.min : 1);
		this.lifeMax.spinner("value", config.lifetime ? config.lifetime.max : 1);
		this.customEase.val(config.ease ? JSON.stringify(config.ease) : "");
		var blendMode;
		//ensure that the blend mode is valid
		if(config.blendMode && cloudkid.ParticleUtils.getBlendMode())
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
		this.blendMode.selectmenu("refresh");

		//emitter settings
		this.emitFrequency.spinner("value", config.frequency || 0.5);
		this.emitLifetime.spinner("value", config.emitterLifetime || -1);
		this.emitMaxParticles.spinner("value", config.maxParticles || 1000);
		this.emitSpawnPosX.spinner("value", config.pos ? config.pos.x : 0);
		this.emitSpawnPosY.spinner("value", config.pos ? config.pos.y : 0);
		this.emitAddAtBack.prop("checked", !!config.addAtBack);

		//spawn type
		var spawnType = config.spawnType, spawnTypes = this.spawnTypes;
		if(spawnTypes.indexOf(spawnType) == -1)
			spawnType = spawnTypes[0];

		//update dropdown
		this.emitSpawnType.val(spawnType);
		this.emitSpawnType.selectmenu("refresh");

		//hide non-type options
		for(var i = 0; i < spawnTypes.length; ++i)
		{
			if(spawnTypes[i] == spawnType)
				$(".settings-" + spawnTypes[i]).show();
			else
				$(".settings-" + spawnTypes[i]).hide();
		}

		//set or reset these options
		this.emitRectX.spinner("value", config.spawnRect ? config.spawnRect.x : 0);
		this.emitRectY.spinner("value", config.spawnRect ? config.spawnRect.y : 0);
		this.emitRectW.spinner("value", config.spawnRect ? config.spawnRect.w : 0);
		this.emitRectH.spinner("value", config.spawnRect ? config.spawnRect.h : 0);
		this.emitCircleX.spinner("value", config.spawnCircle ? config.spawnCircle.x : 0);
		this.emitCircleY.spinner("value", config.spawnCircle ? config.spawnCircle.y : 0);
		this.emitCircleR.spinner("value", config.spawnCircle ? config.spawnCircle.r : 0);
		this.emitParticlesPerWave.spinner("value", config.particlesPerWave > 0 ? config.particlesPerWave : 1);
		this.emitParticleSpacing.spinner("value", config.particleSpacing ? config.particleSpacing : 0);
		this.emitAngleStart.spinner("value", config.angleStart ? config.angleStart : 0);
	};

	/**
	*  Get the config
	*  @method get
	*  @return {object} The config settings
	*/
	p.get = function()
	{
		var output = {};
		
		//particle settings
		output.alpha = {
			start: this.alphaStart.slider("value"),
			end: this.alphaEnd.slider("value")
		};
		output.scale = {
			start: this.scaleStart.spinner("value"),
			end: this.scaleEnd.spinner("value")
		};
		output.color = {
			start: this.colorStart.val(),
			end: this.colorEnd.val()
		};
		output.speed = {
			start: this.speedStart.spinner("value"),
			end: this.speedEnd.spinner("value")
		};
		output.startRotation = {
			min: this.startRotationMin.spinner("value"),
			max: this.startRotationMax.spinner("value")
		};
		output.rotationSpeed = {
			min: this.rotationSpeedMin.spinner("value"),
			max: this.rotationSpeedMax.spinner("value")
		};
		output.lifetime = {
			min: this.lifeMin.spinner("value"),
			max: this.lifeMax.spinner("value")
		};
		output.blendMode = this.blendMode.val();
		var val = this.customEase.val();
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
		output.frequency = this.emitFrequency.spinner("value");
		output.emitterLifetime = this.emitLifetime.spinner("value");
		output.maxParticles = this.emitMaxParticles.spinner("value");
		output.pos = {
			x: this.emitSpawnPosX.spinner("value"), 
			y: this.emitSpawnPosY.spinner("value")
		};
		output.addAtBack = this.emitAddAtBack.prop("checked");

		//spawn type stuff
		var spawnType = output.spawnType = this.emitSpawnType.val();

		if(spawnType == "rect")
		{
			output.spawnRect = {
				x: this.emitRectX.spinner("value"), 
				y: this.emitRectY.spinner("value"),
				w: this.emitRectW.spinner("value"), 
				h: this.emitRectH.spinner("value")
			};
		}
		else if(spawnType == "circle")
		{
			output.spawnCircle = {
				x: this.emitCircleX.spinner("value"), 
				y: this.emitCircleY.spinner("value"),
				r: this.emitCircleR.spinner("value")
			};
		}
		else if(spawnType == "burst")
		{
			output.particlesPerWave = this.emitParticlesPerWave.spinner("value");
			output.particleSpacing = this.emitParticleSpacing.spinner("value");
			output.angleStart = this.emitAngleStart.spinner("value");
		}
		return output;
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
	namespace('cloudkid').EditorInterface = EditorInterface;

}(jQuery));