(function(){

	new cloudkid.Editor({
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

}());