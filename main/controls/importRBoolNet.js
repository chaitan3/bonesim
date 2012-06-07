BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

canvas = document.getElementById('canvas');
img = document.getElementById('Tron');

function LoadMammal() {
	delete network;
	scopes = false;
	BooleNetDebug('Downloading ...');
	data = GET(env['biographer']+'/Get/Mammal_RBoolNet');
	BooleNetDebug('Importing ...');
	network = RBoolNet_Import(data);
	BooleNetDebug('Graphviz ...');
	doGraphviz();
	if (typeof(importRBoolNetWindow) != 'undefined')
		importRBoolNetWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


