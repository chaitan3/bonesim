BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

canvas = document.getElementById('canvas');
img = document.getElementById('Tron');

function LoadMammal() {
  
  
	BooleNetDebug('Downloading ...');
  var data;
	$.get(env['biographer']+'/static/simulator/demo/mammal.r', 
  function(response) {
    data = response;
  });
  
	BooleNetDebug('Importing ...');
	var network = RBoolNet_Import(data);
	//~ BooleNetDebug('Graphviz ...');
	//~ doGraphviz();
	console.log(network); 
  
  importHandle = graph.suspendRedraw(20000);
  
	bui.importFromJSON(graph, network);
  //~ bui.importFromJSON(graph, example);
  
  var nodes_edges = get_nodes_edges();
  
  //~ setTimeout(function() {
    //~ bui.grid.init(nodes_edges.nodes,nodes_edges.edges);
    //~ bui.grid.put_on_grid();
    //~ bui.grid.layout();
    //~ alert('Hi');
    //~ graph.unsuspendRedraw(importHandle);
  //~ }, 2000);
  
  bui.settings.straightenEdges = false;
  var cont = graph.container();
  var force = d3.layout.force()
         .charge(-4000)
         .linkDistance(100)
         .nodes(nodes_edges.nodes)
         .links(nodes_edges.edges)
         .size([$(cont).width(), $(cont).height()])
         .start();
  
  force.on("tick", function() {
    if (force.alpha() < 0.005) {
      force.stop();
      graph.unsuspendRedraw(importHandle);
    }
  });
  
  simulator = new Simulator(network, 500);
  $('#simulation').click(simulator.start);
  
	if (typeof(importRBoolNetWindow) != 'undefined')
		importRBoolNetWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


