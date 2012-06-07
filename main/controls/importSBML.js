
BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

canvas = document.getElementById('canvas');
img = document.getElementById('Tron');

function rotateAroundCenter() {
	alpha = 15;
	width = 70;
	height = 70;
	var context = canvas.getContext('2d');
	context.translate(width/2, height/2);
	context.rotate(alpha*Math.PI/180);
	context.translate(-width/2, -height/2);
	context.drawImage(img, 0, 0);
	timeout = window.setTimeout('rotateAroundCenter();', 50);
	window.onunload = function() { window.clearTimeout(timeout); }
	}

function LoadSBML() {
	delete network;
	scopes = true;
	BooleNetDebug('Downloading ...');
	data = GET(env['biographer']+'/Get/Sample_SBML');
	BooleNetDebug('Importing ...');
	network = SBML_import(data);
	BooleNetDebug('Graphviz ...');
	doGraphviz();
	if (typeof(importSBMLWindow) != 'undefined')
		importSBMLWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


