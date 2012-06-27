
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
	showTab('graphviz');

        // erase SVG canvas
        parent = document.getElementById('graphviz_tab');
        var child = parent.firstChild; 
        while (child!=null) { 
		parent.removeChild(child); 
		child = parent.firstChild; 
		} 

	// valid response ?
	if ( response == null || response == '' ) {
		console.debug("We didn't get anything from the server, aborting, sorry.");
		alert("Graphviz error!");
		return
 		}

	// import graphviz SVG
	var parser = new DOMParser(); 
        var xmlDoc = parser.parseFromString(response, "text/xml"); 
        var xmlRoot = xmlDoc.documentElement; 
        var adopted = document.importNode(xmlRoot, true); 
        parent.appendChild(adopted);

	// start simulation
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
  
function get_nodes_edges(){
        var nodes = [], edges = [];
        var all_drawables = graph.drawables();
        var count = 0;
        for (var key in all_drawables) {
            drawable = all_drawables[key];
            drawable.index = count;
            ++count;
            if ((drawable.identifier()=='bui.EdgeHandle')||(drawable.identifier() == 'bui.Labelable')||(drawable.identifier() == 'Compartment')||(drawable.identifier() == 'bui.StateVariable')||(drawable.identifier() == 'bui.StateVariableER')){
                //ignore
            }else if (drawable.drawableType()=='node'){
                var dparent = drawable.parent();
                if (('absolutePositionCenter' in drawable)&& (!('identifier' in dparent) || dparent.identifier() != 'Complex')){
                    var pos = drawable.absolutePositionCenter();
                    drawable.x = pos.x;
                    drawable.y = pos.y;
                    nodes.push(drawable);
                }
            }else if(drawable.identifier() == 'bui.Edge'){
                //----------------------------------
                if (drawable.source().identifier() == 'bui.EdgeHandle'){
                    if(drawable.source().lparent.target().identifier() == 'bui.StateVariableER'){
                        drawable.lsource = drawable.source().lparent.target().parent();

                    }else if(drawable.source().lparent.target().identifier() == 'bui.EdgeHandle'){ 
                        if(drawable.source().lparent.target().lparent.target().identifier() == 'bui.StateVariableER'){
                            drawable.lsource = drawable.source().lparent.target().lparent.target().parent();
                        }else {
                            drawable.lsource = drawable.source().lparent.target().lparent.target();
                        }
                    }else {
                        drawable.lsource = drawable.source().lparent.target();
                    }
                }else if(drawable.source().identifier() == 'bui.StateVariableER'){
                    drawable.lsource = drawable.source().parent();
                }else {
                    drawable.lsource = drawable.source()
                }
                //----------------------------------
                if (drawable.target().identifier() == 'bui.EdgeHandle'){
                    if(drawable.target().lparent.target().identifier() == 'bui.StateVariableER'){
                        drawable.ltarget = drawable.target().lparent.target().parent();

                    }else if(drawable.target().lparent.target().identifier() == 'bui.EdgeHandle'){ 
                        if(drawable.target().lparent.target().lparent.target().identifier() == 'bui.StateVariableER'){
                            drawable.ltarget = drawable.target().lparent.target().lparent.target().parent();
                        }else {
                            drawable.ltarget = drawable.target().lparent.target().lparent.target();
                        }

                    }else{
                        drawable.ltarget = drawable.target().lparent.target();
                    }

                }else if(drawable.target().identifier() == 'bui.StateVariableER'){
                    drawable.ltarget = drawable.target().parent();
                }else {
                    drawable.ltarget = drawable.target()
                }
                edges.push(drawable);
            }
        }
        return {nodes:nodes, edges:edges}
}

