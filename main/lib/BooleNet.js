
protein_name_regex = /[A-Za-z0-9_]+/g;

// Node types
typeProcess = 'Process';
typeMacromolecule = 'Macromolecule';

// Edge types
typeSubstrate = 'Substrate';
typeProduct = 'Product';
typeCatalysis = 'Catalysis';
typeInhibition = 'Inhibition';


BooleNet2BooleNetJS = function(data) {
			return data.replace_all(' and ', ' && ').replace_all(' or ', ' || ').replace_all(' not ', ' ! ').replace_all('(not ', '(! ');
			}

guessEdgeType = function(label, rule) {
			prefix = rule.substr(rule.indexOf(label)-4, 4);
			if (prefix == 'not ')	// yes, this doesn't always apply, it's provisorically, lateron: lex yacc?
				return typeInhibition;
			suffix = label.substr(label.length-3, 3);
			if (suffix == 'ase')
				return typeCatalysis;
			return typeSubstrate;
			}

getMyState = function(id) {
		// temporary workaround
		mySimulator = simulator;

		return mySimulator.jSBGN.getNodeById(id).simulation.myState;
		}

makeRule = function(rule) {
		if (rule.trim() == 'True' || rule.trim() == 'False')
			return '';
		return rule.replace(protein_name_regex, function(text) { return "getMyState('"+text+"')"; });
		}

BooleNet = {
	Import: function(input) {
			var input = input.split('\n');
			var network = new jSBGN();
			for (index in input) {
				// for every line in the input file
				var line = input[index];
				if (line.length > 0 && line[0] != ' ') {	// non-empty line
					if (line[0] != '#') {			// update rule
						var s = line.split('=');
						if (s.length != 2)
							console.error('Error in BooleNet input file, line '+index+': Broken update rule')
						else	{
							var leftside = s[0].trim();
							s[1] = s[1].trim();
							var rightside = BooleNet2BooleNetJS(s[1]).trim();

							if (leftside.indexOf('*') == -1 && (rightside != 'True' && rightside != 'False'))
								console.warn('Warning in BooleNet input file, line '+index+': Left side of update rule lacks obligatory asterisk');

							// create target node if necessary
							var targetNodeId = leftside.replace('*','').trim();
							var targetNode = network.getNodeById(targetNodeId);
							if (targetNode == null) {
								var targetNode = {};
								targetNode.id = targetNodeId;
								targetNode.type = typeMacromolecule;
								targetNode.data = {};
								targetNode.data.label = targetNodeId;
								targetNode.edges = [];
								targetNode.simulation = {
											myState : true, // set default initial state
											update : true,
											updateRule : '',
											updateRulePy : ''
											};
								network.appendNode(targetNode);
								}

							// in case it's an initial state definition ("... = True/False")
							if (s[1] == 'True')
								targetNode.simulation.myState = true;
							if (s[1] == 'False')
								targetNode.simulation.myState = false;

							else	{
								// create a process node
								var processNodeId = 'process'+targetNodeId;
								var processNode = network.getNodeById(processNodeId);
								if (processNode != null)
									var processNodeId = 'process'+targetNodeId+('_'+Math.random()).replace('.', '').substr(0, 4);
								var processNode = {}
								processNode.id = processNodeId;
								processNode.type = typeProcess;
								processNode.data = {};
								processNode.data.label = '';
								processNode.edges = [];
								processNode.simulation = {
											 myState : true, // set default initial state
											 update : true,
											 updateRule : '',
											 updateRulePy : ''
											 };
								network.appendNode(processNode);

								// import update rule
								targetNode.simulation.updateRule = makeRule(rightside);
								targetNode.simulation.updateRulePy = s[0]+' = '+s[1].trim();

								// for every node on the right side of the rule, create nodes if necessary, and add edges
								var sourceNodeIds = rightside.match(protein_name_regex);
								for (idx in sourceNodeIds) {
									var sourceNodeId = sourceNodeIds[idx];
									if (sourceNodeId != "True" && sourceNodeId != "False") {

										// create source node if necessary
										var sourceNode = network.getNodeById(sourceNodeId);
										if (sourceNode == null) {			
											var sourceNode = {};
											sourceNode.id = sourceNodeId;
											sourceNode.type = typeMacromolecule;
											sourceNode.data = {};
											sourceNode.data.label = sourceNodeId;
											sourceNode.edges = [];
											sourceNode.simulation = {
														myState: true,	// set default initial state
														update: true,
														updateRule: ''
														};
											network.appendNode(sourceNode);
											}

										// don't create a process node for the source node here
							
										// create edge from source to process node
										var edge = network.getEdgeBySourceAndTargetId(sourceNodeId, processNodeId);
										if (edge == null) {
											var edge = {};
											edge.id = sourceNodeId+'_'+processNodeId;
											edge.source = sourceNodeId;
											edge.target = processNodeId;
											edge.sourceNode = sourceNode;
											edge.targetNode = processNode;
											edge.type = guessEdgeType(sourceNode.data.label, s[1]);
											sourceNode.edges.push(edge);
											processNode.edges.push(edge);
											network.appendEdge(edge);
											}

										// create edge from process to target node
										var edge = network.getEdgeBySourceAndTargetId(processNodeId, targetNodeId);
										if (edge == null) {
											var edge = {};
											edge.id = processNodeId+' -> '+targetNodeId;
											edge.source = processNodeId;
											edge.target = targetNodeId;
											edge.sourceNode = processNode;
											edge.targetNode = targetNode;
											edge.type = typeProduct;
											processNode.edges.push(edge);
											targetNode.edges.push(edge);
											network.appendEdge(edge);
											}
										}
									}
								}
							}
						}
					else	{				// comment or instruction
						if (line.indexOf('# States of ') == 0) {		// state description
							var colon = line.indexOf(':');
							var nodeId = line.substring(12, colon);
							var node = network.getNodeById(nodeId);
							if (node == null)
								console.error('Error in BooleNet input file, line '+index+': Failed to define states. No such node: "'+nodeId+'"');
							else	{
								var setup = line.substring(colon+1);
								var a = setup.indexOf('"')+1;
								var b = setup.indexOf('"', a);
								var c = setup.indexOf('"', b+1)+1;
								var d = setup.indexOf('"', c);
								var True = setup.substring(a, b);
								var False = setup.substring(c, d);
								if (typeof(node.simulation) === 'undefined')
									node.simulation = {};
								node.simulation.states = [True, False];
//								console.log(node.id+' states: '+[True, False]);
								}
							}
						else if (line.indexOf('# Annotation of ') == 0) {	// annotation
							var colon = line.indexOf(':');
							var nodeId = line.substring(16, colon);
							var node = network.getNodeById(nodeId);
							if (node == null)
								console.error('Error in BooleNet input file, line '+index+': Failed to annotate. No such node: "'+nodeId+'"')
							else	{
								var setup = line.substring(colon+1);
								var a = setup.indexOf('"')+1;
								var b = setup.lastIndexOf('"');
								var annotation = setup.substring(a, b);
								if (typeof(node.simulation) === 'undefined')
									node.simulation = {};
								node.simulation.annotation = annotation.replace('<iframe src=', '<iframe width="99%" height="90%" src=');
//								console.log(node.id+' annotation: '+a+'-'+b+'-'+annotation);
								}
							}
						}
					}
				}
			console.log('Imported '+network.nodes.length+' nodes and '+network.edges.length+' edges.');
//			console.log((network.getNodeById('Whi3p').simulation.updateRule);

			if (network.nodes.length == 0 && network.edges.length == 0)
				alert('Invalid BooleNet network!');

			return network;
			},

	ImportFile: function() {
//		document.getElementById('ButtonCol').style.display = 'none';
//		document.getElementById('ProgressCol').style.display = 'inline';
//		RotateTronCircle('canvas');
		console.debug('Opening file ...');
		var reader = new FileReader();
		reader.readAsText(document.getElementById('File').files[0]);
		reader.onload = this.FileOpened;
		currentBooleNet = this;
		},

	FileOpened: function(evt) {	// this = FileReader Object
		currentBooleNet.ProcessFile(evt.target.result);
		},

	ProcessFile: function(data) {
		console.debug('Importing file ...');
		network = BooleNet.Import(data);
		console.debug('Requesting graphviz SVG from server ...');
		doGraphviz();
		if (typeof(importBooleNetWindow) != 'undefined')
			importBooleNetWindow.close();
		if (typeof(popupControls) != 'undefined')
			window.setTimeout('popupControls.close();', 300);
		}

	}

