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
	data = GET(env['biographer']+'/static/simulator/demo/mammal.r');
	BooleNetDebug('Importing ...');
	network = RBoolNet_Import(data);
	//~ BooleNetDebug('Graphviz ...');
	//~ doGraphviz();
	console.log(network); 
	bui.importFromJSON(graph, network);
	console.log(graph.drawables());
	draws = graph.drawables();
	if (typeof(importRBoolNetWindow) != 'undefined')
		importRBoolNetWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


