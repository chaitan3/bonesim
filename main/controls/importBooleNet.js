
function LoadWhi2() {
	delete network;
	scopes = false;
	console.debug('Downloading ...');
	data = GET(env['biographer']+'/Get/Whi2_boolenet');
	importBooleNet(data);
	}

