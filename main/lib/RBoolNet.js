//Todo: jslint strict

/**
 * Replace R logic operators with that of Javascript.
 * @param {string} data - The update rule in R format
 * @return {string} The update rule in JS format
 */
function RBoolNet2JS(data) {
	return data.replace_all(' & ', ' && ').replace_all(' | ', ' || ').trim();
}
/**
 * Fetch the node from the network given the node id, create it if it
 * does not exist.
 * @param {jSBGN} network - The Boolean Network object.
 * @param {int} nodeID - The id of the node.
 * @return {node} The node object.
 */
function returnNode(network, nodeId) {
	var node = network.getNodeById(nodeId);
	//Create node if it does not exist
	if (node == null) {		
		node = {};
		node.id = nodeId;
		node.type = 'Simple Chemical';
		node.sbo = 240;
		node.data = {};
		node.data.label = nodeId;
		node.edges = [];
		node.simulation = {
			myState : true,	//Default state of a node is true
			update : true,
			updateRule : '',
			updateRuleR : ''
		};
		network.appendNode(node);
	}
	return node;
}
/**
 * Import a R BoolNet file into a jSBGN object.
 * @param {string} file - The contents of the R BoolNet file.
 * @return {jSBGN} An object containing the Boolean network.
 */
function RBoolNet_Import(file) {
	var lines, cols, i, j, network, targetNodeId, sourceNodeIds, rule, edge, targetNode, sourceNode;
	network = new jSBGN();
	lines = file.split('\n');	//The file consists of a set of lines describing each node
	for (i = 1; i < lines.length && lines[i].trim().length > 0; i++) {
		cols = lines[i].split(',');
		targetNodeId = cols[0].trim();	//The target node name
		if (cols.length != 2) {
			console.log("The given R BoolNet file cannot be processed");
		}
		targetNode = returnNode(network, targetNodeId);
		targetNode.simulation.updateRule = RBoolNet2JS(cols[1]);
		targetNode.simulation.updateRuleR = cols[0].trim() + ' <- ' + cols[1].trim();
		//Get the list of nodes specified in the update rule
		sourceNodeIds = cols[1].match(protein_name_regex);
		for (j in sourceNodeIds) {
			sourceNode = returnNode(network, sourceNodeIds[j]);
			//Create an edge between the two nodes
			edge = network.getEdgeBySourceAndTargetId(sourceNodeIds[j], targetNodeId);
			if (edge == null) {
				edge = {};
				edge.id = sourceNodeIds[j] + ' -> ' + targetNodeId;
				edge.source = sourceNodeIds[j];
				edge.target = targetNodeId;
				edge.sourceNode = sourceNode;
				edge.targetNode = targetNode;
				sourceNode.edges.push(edge);
				targetNode.edges.push(edge);
				network.appendEdge(edge);
			}
		}
	}
	console.log('imported ' + network.nodes.length + ' nodes and ' + network.edges.length + ' edges.');
	return network;
}
