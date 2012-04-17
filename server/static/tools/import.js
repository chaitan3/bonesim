
document.onkeyup = function(e) {
			if (e.keyCode == 27) {
				window.close();	// Esc
				}
			};

function ImportChain() {
	document.getElementById('ButtonCol').style.display = 'none';
	document.getElementById('ProgressCol').style.display = 'inline';
	rotateAroundCenter();
	debug('Opening file ...');
	var reader = new FileReader();
	reader.readAsText(document.getElementById('File').files[0]);
	reader.onload = Opened;
	}

function Opened(evt) {
	data = evt.target.result;
	debug('Opened. Asking the server to translate the file ...');
	window.setTimeout('Translate('+data+');', 100);
	}

function Translate(data) {
	if ( Translator != null ) {
		ServerTimeout = window.setTimeout('ServerTimedOut();', 10);
		try	{
			translated = POST(Translator, 'data='+data).replace('\n','').replace('\t','');
			}
		catch(err) {
			debug(err);
			alert(err);
			return
			}
		finally {
			window.clearTimeout(ServerTimeout);
			debug('Translated. Parsing JSON ...');
			window.setTimeout('Parse();', 100);
			}
		}
	else
		Parse();
	}

function ServerTimedOut() {
	debug('Server timeout :-(');
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
	UI_window.network = json;
	if ( document.getElementById('layout').checked ) {
		debug(s+'<br/>Asking the server to make a nice layout ...');
		window.setTimeout('doLayout();', 100);
		}
	else	doneLayouting(null);
	}

function doLayout() {
	var network = { nodes: UI_window.network.nodes, edges: UI_window.network.edges }; // no Boolean Network
	var json = JSON.stringify(network);
	POST(env['biographer']+'/Layout/biographer', 'network='+json, doneLayouting);
	}

function doneLayouting(response) {
	if ( response != null )
		UI_window.network = parseJSON(response);
	if ( document.getElementById('graphviz').checked ) {
		debug('Plotting using Graphviz ...');
		window.setTimeout('doGraphviz();', 100);
		}
	else	doneGraphviz(null);
	}

function doGraphviz() {
	var json = JSON.stringify( UI_window.network.exportJSON() );
	POST(env['biographer']+'/Plot/graphviz', 'network='+json, doneGraphviz);
	}

function doneGraphviz(response) {
	if ( response != null ) {
		var parser = new DOMParser(); 
		var xmlDoc = parser.parseFromString(response, "text/xml"); 
		elt = UI_window.document.getElementById('graphviz_tab');

		// eliminate any children 
		var child = elt.firstChild; 
		while (child!=null) 
		{ 
		elt.removeChild(child); 
		child = elt.firstChild; 
		} 

		var xmlRoot = xmlDoc.documentElement; 

//		var script = document.createElementNS("http://www.w3.org/2000/svg", "script");
//		script.setAttribute("src", "/biographer/static/tools/SVGPan.js");
//		xmlRoot.insertBefore(script, xmlRoot.firstChild);

		var adopted = document.importNode(xmlRoot, true); 
		elt.appendChild(adopted); 

//		UI_window.document.getElementById('viewport').setAttribute('transform', 'scale(0.4 0.4)');
//		UI_window.setupHandlers(xmlDoc.documentElement);
		}
	if ( document.getElementById('update').checked ) {
		debug('Updating UI ...');
		window.setTimeout('updateUI();', 100);
		}
	else
		window.close();
	}

function updateUI() {
//	delete UI_window.graph;
//	UI_window.graph = new UI_window.bui.Graph( UI_window.document.body );
//	UI_window.bui.importFromJSON(UI_window.graph, UI_window.network);
	debug('UI updated. '+UI_window.network.nodes.length+' nodes, '+UI_window.network.edges.length+' edges.');
	UI_window.StartSimulation();
	window.setTimeout('window.close();', 500);
	window.setTimeout('window.close();', 1000);
	window.close();
	}

