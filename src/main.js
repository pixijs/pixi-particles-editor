(function(){

	// Create an app and assign it to the global 
	// space so that we can debug
	window.app = new pixiparticles.App({
		framerate: "framerate",
		fps: 60,
		raf: true,
		debug: DEBUG,
		resizeElement: "content",
		uniformResize: false
	});

}());