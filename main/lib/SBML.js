
jSBGN.prototype.importSBML = function(file) {
	var i, json, data;
  
  var formData = new FormData();
  formData.append('file', file);
  $.ajax({
        url: env['biographer']+'/Put/UploadSBML',
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false
  });

  $.get(env['biographer']+'/Get/processedSBML', 
  function(response) {
    data = response;
  });
	json = parseJSON(data);
  this.nodes = json.nodes;
  this.edges = json.edges;
  
	for (i in this.nodes) {
    var node = this.nodes[i];
		node.simulation = {
			myState : true,	//Default state of a node is true
			update : true,
			updateRule : ''
		};
		if ((node.type == 'Compartment') || (node.type == 'Process')) {
			node.simulation.myState = false;
			node.simulation.update = false;
		}
	}
}

jSBGN.prototype.applyGuessSeed = function() {
  var data, seed, node;
  $.get(env['biographer']+'/Simulate/InitialSeed', 
    function(response) {
      data = response;
    });
	seed = parseJSON(data);
	for (i in this.nodes) {
    node = this.nodes[i];
		if (node.simulation.update) {
			if(seed[node.id])
				node.simulation.myState = true;
			else
				node.simulation.myState = false;
		}
	}
}
