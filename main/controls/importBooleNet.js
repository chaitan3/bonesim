BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

canvas = document.getElementById('canvas');
img = document.getElementById('Tron');

// integrate below into BooleNet library object

function BooleNetImportChain() {
	document.getElementById('ButtonCol').style.display = 'none';
	document.getElementById('ProgressCol').style.display = 'inline';
//	RotateTronCircle('canvas');
	console.debug('Opening file ...');
	var reader = new FileReader();
	reader.readAsText(document.getElementById('File').files[0]);
	reader.onload = BooleNetOpened;
	}

function BooleNetOpened(evt) {
	BooleNetImport(evt.target.result);
	}

function BooleNetImport(data) {
	console.debug('Importing ...');
	network = BooleNet.Import(data);
	console.debug('Graphviz ...');
	doGraphviz();
	if (typeof(importBooleNetWindow) != 'undefined')
		importBooleNetWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}

function LoadWhi2() {
	delete network;
	scopes = false;
	console.debug('Downloading ...');
	data = GET(env['biographer']+'/Get/Whi2_boolenet');
	importBooleNet(data);
	}

