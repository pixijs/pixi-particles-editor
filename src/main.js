//initialize jquery UI
$(document).tooltip();//enable tooltips for any element with a title attribute

//enable the buttons at the top
$("#refresh").button({icons:{primary:"ui-icon-arrowrefresh-1-s"}});
$("#loadConfig").button({icons:{primary:"ui-icon-folder-open"}});

//$("#clipboard").button({icons:{primary:"ui-icon-copy"}});
$("#downloadConfig").button({icons:{primary:"ui-icon-arrowthickstop-1-s"}});

//$("button").button();//enable all button elements
//enable all unit sliders (0-1)
$(".unitSlider").slider({
	animate: "fast",
	min: 0,
	max: 1,
	step: 0.01
});
//set up all sliders to change their text input when they slide or
//or are changed externally
var sliders = $(".slider");
sliders.on("slide slidechange", function(event, ui) {
	$(this).children("input").val(ui.value);
});
//set up all sliders to get changed by their text inputs
//this also changes the text input, which clamps values in the sliders
$(".slider input").change(function() {
	$(this).parent().slider("value", $(this).val().replace(/[^0-9.]+/,""));
});
//set up all spinners that can't go negative
$(".positiveSpinner").spinner({
	min: 0,
	numberFormat: "n",
	step: 0.01
});
//set up all spinners that can't go negative
$(".frequencySpinner").spinner({
	min: 0,
	numberFormat: "n",
	step: 0.001
});
//set up general spinners
$(".generalSpinner").spinner({
	numberFormat: "n",
	step: 0.1
});
//set up integer spinners
$(".posIntSpinner").spinner({
	min: 1,
	step: 1
});
//enable color pickers
$(".colorPicker").colorpicker({
	parts: ["header", "map", "bar", "hsv", "rgb", "hex", "preview", "footer"],
	showOn: "both",
	buttonColorize: true,
	revert: true,
	mode: "h",
	buttonImage: "assets/js/colorpicker/images/ui-colorpicker.png"
});
//enable image upload dialog
$("#addImage").button();
$("#addImage").click(function(event) {
	$("#defaultImageSelector").find("option:contains('-Default Images-')").prop("selected",true);
	$("#defaultImageSelector").selectmenu("refresh");
	$("#imageUpload").wrap('<form>').parent('form').trigger('reset');
	$("#imageUpload").unwrap();
	$("#imageDialog").dialog("open");
	event.preventDefault();
});
$("#imageDialog").dialog({
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
$("#defaultImageSelector").selectmenu();
//enable config upload dialog
$("#loadConfig").click(function(event) {
	$("#defaultConfigSelector").find("option:contains('-Default Emitters-')").prop("selected",true);
	$("#defaultConfigSelector").selectmenu("refresh");
	$("#configUpload").wrap('<form>').parent('form').trigger('reset');
	$("#configUpload").unwrap();
	$("#configPaste").val("");
	$("#configDialog").dialog("open");
	event.preventDefault();
});
$("#configDialog").dialog({
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
$("#defaultConfigSelector").selectmenu();
//enable spawn type stuff
$("#emitSpawnType").selectmenu({
	select: function(event, ui)
	{
		var spawnTypes = cloudkid.Application.instance.spawnTypes;
		var value = $("#emitSpawnType option:selected").val();
		for(var i = 0; i < spawnTypes.length; ++i)
		{
			if(spawnTypes[i] == value)
				$(".settings-" + spawnTypes[i]).show();
			else
				$(".settings-" + spawnTypes[i]).hide();
		}
	}
});

//initialize editor app
var app = new cloudkid.Editor({
	framerate: "framerate",
	fps: 60,
	raf: true,
	resizeElement: "content",
	uniformResize: false,
	canvasId: "stage",
	display: cloudkid.PixiDisplay,
	displayOptions: {
		clearView: true,
		transparent: false,
		backgroundColor: 0x999999
	}
});