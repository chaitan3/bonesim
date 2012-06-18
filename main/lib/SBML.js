
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


SBML = {
	// creates jSBGN from SBML text
	Import: function(text) {
			this.network = jSBGN();

			var xml = document.implementation.createDocument("","",null);
			xml.write(text);

			// list all compartments

			// list all species (nodes)

			// list all transitions

			alert("XML Root Tag Name: " + xml.documentElement.tagName);
			alert("First Child: " + xml.documentElement.childNodes[1].firstChild.tagName);
			alert("Last Child: " + xml.documentElement.childNodes[1].lastChild.tagName);
			alert("Node Value: " + xml.documentElement.childNodes[0].attributes[0].nodeValue);
			alert("Node Value: " + xml.documentElement.childNodes[0].attributes.getNamedItem("id").nodeValue);
			alert("getElementsByTagName: " + xml.getElementsByTagName("year")[0].attributes.getNamedItem("id").nodeValue);
			alert("Text Content for Employee Tag: " + xml.documentElement.childNodes[0].text);
			alert("Checking Child Nodes: " + xml.documentElement.childNodes[0].hasChildNodes);
			},

	// returns SBML text
	Export: function() {
			
			}
	}

