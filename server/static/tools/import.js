
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
	network = json;
	if ( document.getElementById('layout').checked ) {
		debug(s+'<br/>Asking the server to make a nice layout ...');
		window.setTimeout('doLayout();', 100);
		}
	else	doneLayouting(null);
	}

function doLayout() {
	var network = { nodes: network.nodes, edges: network.edges }; // no Boolean Network
	var json = JSON.stringify(network);
	POST(env['biographer']+'/Layout/biographer', 'network='+json, doneLayouting);
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
	var json = JSON.stringify( network.exportJSON() );
	alert(json);
	POST(env['biographer']+'/Plot/graphviz', 'network='+json, doneGraphviz);
	}

function doneGraphviz(response) {
	if ( response != null ) {
//		DOMinsert(response, document.getElementById('graphviz_tab'));
/*
		var parser = new DOMParser(); 
                var xmlDoc = parser.parseFromString(response, "text/xml"); 
                elt = document.getElementById('graphviz_tab');

                // eliminate any children 
                var child = elt.firstChild; 
                while (child!=null) 
                { 
                elt.removeChild(child); 
                child = elt.firstChild; 
                } 

                var xmlRoot = xmlDoc.documentElement; 

                var adopted = document.importNode(xmlRoot, true); 
                elt.appendChild(adopted);
*/
		alert(response);
		document.getElementById('graphviz_tab').innerHTML = response;
 		}
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

