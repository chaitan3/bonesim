BooleNetDebug = function(msg) {
			document.getElementById('BooleNetDebug').innerHTML = msg;
			}
debug = BooleNetDebug;

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

function LoadWhi2p() {
	debug('Downloading ...');
	data = GET(env['biographer']+'/Get/Whi2p_boolenet');
	debug('Importing ...');
	network = BooleNet.Import(data);
	debug('Graphviz ...');
	doGraphviz();
	importBooleNetWindow.close();
	window.setTimeout('popupControls.close();', 300);
	}

