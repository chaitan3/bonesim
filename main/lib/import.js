
function ImportChain() {
	document.getElementById('ButtonCol').style.display = 'none';
	document.getElementById('ProgressCol').style.display = 'inline';
//	RotateTronCircle('canvas');
	console.debug('Opening file ...');
	var reader = new FileReader();
	reader.readAsText(document.getElementById('File').files[0]);
	reader.onload = Opened;
	}

function Opened(evt) {
	data = evt.target.result;
	debug('Opened. Asking the server to translate the file ...');
	window.setTimeout('Translate('+data+');', 100);
	}

function parseJSON(string) {
	try 	{	// var response = JSON.parse(translated);
			eval('var obj = '+string+';');	// very dangerous for man-in-the middle code injection !!!
							// but seems to be faster
		}
	catch(err) {	debug('Fatal: JSON parsing failed.');
			alert('Server did not send a valid JSON response!');
			return ""
		}
	return obj;
	}

function Parse() {
	json = parseJSON(translated);
	s = 'Import successfull: '+json['nodes'].length+' nodes, '+json['edges'].length+' edges';
	network = json;
	if ( document.getElementById('layout').checked ) {
		debug(s+'<br/>Asking the server to make a nice layout ...');
		window.setTimeout('doLayout();', 100);
		}
	else	doneLayouting(null);
	}

function doLayout() {
	POST(env['biographer']+'/Layout/biographer', 'network='+network.exportJSONstring(), doneLayouting);
	}

function doneLayouting(response) {
	if ( response != null )
		network = parseJSON(response);
	if ( document.getElementById('graphviz').checked ) {
		debug('Plotting using Graphviz ...');
		window.setTimeout('doGraphviz();', 100);
		}
	else	doneGraphviz(null);
	}

function doGraphviz() {
	document.getElementById('graphviz_tab').style.visibility = 'hidden';
	POST(env['biographer']+'/Plot/graphviz', 'orphans=yes&network='+network.exportJSONstring(), doneGraphviz);
	}

function doneGraphviz(response) {
	if ( response != null ) {
//		DOMinsert(response, document.getElementById('graphviz_tab'));

		var parser = new DOMParser(); 
                var xmlDoc = parser.parseFromString(response, "text/xml"); 
                parent = document.getElementById('graphviz_tab');

                // eliminate any children 
                var child = parent.firstChild; 
                while (child!=null) 
                { 
                parent.removeChild(child); 
                child = parent.firstChild; 
                } 

                var xmlRoot = xmlDoc.documentElement; 

                var adopted = document.importNode(xmlRoot, true); 
                parent.appendChild(adopted);

		new OpacityFader(document.getElementById('graphviz_tab'), start=0, stop=1, duration=600, delayStart=500);
 		}

	simulator = new Simulator();
	simulator.Initialize(network, document.getElementById('viewport')); // <g>, not <svg>
	window.setTimeout('simulator.Iterate();', 1000);

/*	if ( document.getElementById('update').checked ) {
		debug('Updating UI ...');
		window.setTimeout('updateUI();', 100);
		}
	else
		window.close();
*/
	}

function updateUI() {
//	delete graph;
//	graph = new bui.Graph( document.body );
//	bui.importFromJSON(graph, network);
	debug('UI updated. '+network.nodes.length+' nodes, '+network.edges.length+' edges.');
	StartSimulation();
//	window.setTimeout('window.close();', 500);
//	window.setTimeout('window.close();', 1000);
//	window.close();
	}

