
BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

function LoadSBML() {
	delete network;
	scopes = true;
	BooleNetDebug('Downloading ...');
	data = GET(env['biographer']+'/Get/Sample_SBML');
	BooleNetDebug('Importing ...');
	network = SBML_import(data);
	if (document.getElementById('guess').checked) {
		data = GET(env['biographer']+'/Simulate/InitialSeed');
		SBML_importGuessSeed(data);
		console.log('Guess seed chosen.');
	}
	BooleNetDebug('Graphviz ...');
	doGraphviz();
	if (typeof(importSBMLWindow) != 'undefined')
		importSBMLWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


