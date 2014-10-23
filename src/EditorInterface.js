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
			"alpha",
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
		$("[data-toggle='tooltip']").tooltip({
			container: 'body',
			animation: false
		});

		this.alpha.slider({
			formatter: function(alpha) {
				return 'Start: ' + alpha[0] + ", End: " + alpha[1];
			}
		});

		$(".spinner").TouchSpin({
			verticalbuttons: true
	    });

	    $('.bootstrap-touchspin-prefix, bootstrap-touchspin-postfix').remove();

		// //enable all unit sliders (0-1)
		// $(".unitSlider").slider({
		// 	animate: "fast",
		// 	min: 0,
		// 	max: 1,
		// 	step: 0.01
		// }).on('slidechange slidestop', changed);

		// //set up all sliders to change their text input when they slide or
		// //or are changed externally
		// var sliders = $(".slider");
		// sliders.on("slide slidechange", function(event, ui) {
		// 	$(this).children("input").val(ui.value);
		// }).on('slidechange slidestop', changed);

		// //set up all sliders to get changed by their text inputs
		// //this also changes the text input, which clamps values in the sliders
		// $(".slider input").change(function() {
		// 	$(this).parent().slider("value", $(this).val().replace(/[^0-9.]+/,""));
		// 	changed();
		// });

		// //set up all spinners that can't go negative
		// $(".positiveSpinner").spinner({
		// 	min: 0,
		// 	numberFormat: "n",
		// 	step: 0.01
		// }).on('spinchange spinstop', changed);

		// //set up all spinners that can't go negative
		// $(".frequencySpinner").spinner({
		// 	min: 0,
		// 	numberFormat: "n",
		// 	step: 0.001
		// }).on('spinchange spinstop', changed);

		// //set up general spinners
		// $(".generalSpinner").spinner({
		// 	numberFormat: "n",
		// 	step: 0.1
		// }).on('spinchange spinstop', changed);

		// //set up integer spinners
		// $(".posIntSpinner").spinner({
		// 	min: 1,
		// 	step: 1
		// }).on('spinchange spinstop', changed);

		// //enable color pickers
		// $(".colorPicker").colorpicker({
		// 	parts: ["header", "map", "bar", "hsv", "rgb", "hex", "preview", "footer"],
		// 	showOn: "both",
		// 	buttonColorize: true,
		// 	okOnEnter: true,
		// 	revert: true,
		// 	mode: "h",
		// 	buttonImage: "assets/js/colorpicker/images/ui-colorpicker.png",
		// 	select: changed
		// });

		// this.renderer.buttonset().find('input').change(function(){
		// 	self.trigger('renderer', this.value);
		// 	changed();
		// });

		// //enable blend mode selector
		// this.blendMode.selectmenu().on('selectmenuchange', changed);

		// //listen to custom ease changes
		// this.customEase.on("input", changed);

		// //enable image upload dialog
		// this.addImage
		// 	.button()
		// 	.click(function(event) {
		// 		self.defaultImageSelector.find("option:contains('-Default Images-')").prop("selected",true);
		// 		self.defaultImageSelector.selectmenu("refresh");
		// 		self.imageUpload.wrap('<form>').parent('form').trigger('reset');
		// 		self.imageUpload.unwrap();
		// 		self.imageDialog.dialog("open");
		// 		event.preventDefault();
		// 	});

		// this.imageDialog.dialog({
		// 	autoOpen: false,
		// 	width: 400,
		// 	buttons: [
		// 		{
		// 			text: "Cancel",
		// 			click: function() {
		// 				$(this).dialog( "close" );
		// 			}
		// 		}
		// 	]
		// });

		// this.defaultImageSelector.selectmenu();

		// //enable config upload dialog
		// this.loadConfig.click(function(event) {
		// 	self.defaultConfigSelector
		// 		.find("option:contains('-Default Emitters-')")
		// 		.prop("selected",true);
		// 	self.defaultConfigSelector.selectmenu("refresh");
		// 	self.configUpload.wrap('<form>').parent('form').trigger('reset');
		// 	self.configUpload.unwrap();
		// 	self.configPaste.val("");
		// 	self.configDialog.dialog("open");
		// 	event.preventDefault();
		// });

		// this.configDialog.dialog({
		// 	autoOpen: false,
		// 	width: 400,
		// 	buttons: [
		// 		{
		// 			text: "Cancel",
		// 			click: function() {
		// 				$(this).dialog( "close" );
		// 			}
		// 		}
		// 	]
		// });

		// this.defaultConfigSelector.selectmenu();

		var spawnTypes = this.spawnTypes;

		//enable spawn type stuff
		this.emitSpawnType.change(function(event){

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
		this.stageColor.change(function(e, data){
			self.trigger('stageColor', data.formatted);
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
		this.alpha.data('slider').setValue([
			config.alpha ? config.alpha.start : 1, 
			config.alpha ? config.alpha.end : 1]
		);
		this.scaleStart.val(config.scale ? config.scale.start : 1);
		this.scaleEnd.val(config.scale ? config.scale.end : 1);
		this.minimumScaleMultiplier.val(config.scale ? (config.scale.minimumScaleMultiplier || 1) : 1);
		this.colorStart.val(config.color ? config.color.start : "FFFFFF");
		this.colorEnd.val(config.color ? config.color.end : "FFFFFF");
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
		var start = parseFloat(this.alphaStart.val());
		var end = parseFloat(this.alphaEnd.val());
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
					output.ease = val;
			}
			catch(e)
			{
				Debug.error("Error evaluating easing data: " + e.message);
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