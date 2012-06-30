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

String.prototype.replace_all = function(needle, replacement)
				{
					var haystack = String(this);
					while ( haystack.indexOf(needle) > -1 ) {
						haystack = haystack.replace(needle, replacement);
						}
					return haystack;
				};

if (typeof(String.prototype.trim) === "undefined")
	{
	    String.prototype.trim = function() 
				    {
					return String(this).replace(/^\s+|\s+$/g, '');
				    };
	}
// Array Remove - By John Resig (MIT Licensed)

Array.drop = function(from, to) {
		  var rest = this.slice((to || from) + 1 || this.length);
		  this.length = from < 0 ? this.length + from : from;
		  return this.push.apply(this, rest);
		};

Array.push = function(el) {				// kind of a bugfix, because arr.push doesn't work (in Chromium)
		this = this.concat([el]);
		}

function show(id) {
	document.getElementById(id).style.visibility = 'visible';
	}

function hide(id) {
	document.getElementById(id).style.visibility = 'hidden';
	}



