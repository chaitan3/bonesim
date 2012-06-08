
function SBML_import(file) {
	var i, json, network;
	json = parseJSON(data);
	network = new jSBGN(json.nodes, json.edges);
	for (i in network.nodes) {
		network.nodes[i].simulation = {
			myState : true,	//Default state of a node is true
			update : true,
			updateRule : ''
		};
		if ((network.nodes[i].type == 'Compartment') || (network.nodes[i].type == 'Process')) {
			network.nodes[i].simulation.myState = false;
			network.nodes[i].simulation.update = false;
		}
	}
	return network;
}

function SBML_importGuessSeed(data) {
	seed = parseJSON(data);
	for (i in network.nodes) {
		if (network.nodes[i].simulation.update) {
			if(seed[network.nodes[i].id])
				network.nodes[i].simulation.myState = true;
			else
				network.nodes[i].simulation.myState = false;
		}
	}
}
