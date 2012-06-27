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
  
  s = graph.suspendRedraw(2000);
  
	bui.importFromJSON(graph, network);
  //~ bui.importFromJSON(graph, example);
  
  nodes_edges = get_nodes_edges();
  
  bui.grid.init(nodes_edges.nodes,nodes_edges.edges);
  bui.grid.put_on_grid();
  bui.grid.layout();
  
  //~ bui.settings.straightenEdges = false;
  //~ var cont = graph.container();
  //~ var force = d3.layout.force()
         //~ .charge(-4000)
         //~ .linkDistance(100)
         //~ .nodes(nodes_edges.nodes)
         //~ .links(nodes_edges.edges)
         //~ .size([$(cont).width(), $(cont).height()])
         //~ .start();
  
  graph.unsuspendRedraw(s);
  
  console.log(graph.drawables());
	draws = graph.drawables();
  
  
  simulator = new Simulator(network, graph.nodeGroup());
  
  //why does setAttribute not work in place of style
  //why is so much time being spent in updating, try jquery fader solution
  //PS: Used suspendRedraw and unsuspendRedraw to improve performance
  //integrate layouter
  //sbo mapping
  //learn js classes and write better code 
  //file i/o, initial interface
  //removing stuff for jquery
  
	if (typeof(importRBoolNetWindow) != 'undefined')
		importRBoolNetWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


