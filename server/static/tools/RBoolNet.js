//Todo
//Documentation of code: functions, descriptions, statements jsdoc
//Test code quality using jslint
//Error handling

function RBoolNet2JS(data) {
	return makeRule(data.replace_all(' & ', ' && ').replace_all(' | ', ' || ').trim());
}

function returnNode(network, nodeId) {
	var node = network.getNodeById(nodeId);
	if (node == null) {			
		node = {};
		node.id = nodeId;
		node.data = {};
		node.data.label = nodeId;
		node.edges = [];
		node.simulation = {
			myState : true,
			update : true,
			updateRule : '',
			updateRuleR : ''
		};
		network.appendNode(node);
	}
	return node;
}

function RBoolNet_Import(file) {
	var lines, cols, i, j, network, targetNodeId, sourceNodeIds, rule, edge, targetNode, sourceNode;
	network = new jSBGN();
	lines = file.split('\n');
	for (i = 1; i < lines.length && lines[i].trim().length > 0; i++) {
		cols = lines[i].split(',');
		targetNodeId = cols[0].trim();
		targetNode = returnNode(network, targetNodeId);
		targetNode.updateRule = RBoolNet2JS(cols[1]);
		//console.log(targetNode.updateRule);
		targetNode.updateRuleR = cols[0].trim() + ' <- ' + cols[1].trim();
		sourceNodeIds = cols[1].match(protein_name_regex);
		for (j in sourceNodeIds) {
			sourceNode = returnNode(network, sourceNodeIds[j]);
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
