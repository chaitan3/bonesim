
protein_name_regex = /[A-Za-z0-9_]+/g;

BooleNet2BooleNetJS = function(data) {
			return data.replace_all(' and ', ' && ').replace_all(' or ', ' || ').replace_all(' not ', ' ! ').replace_all('(not ', '(! ');
			}

guessEdgeType = function(label, rule) {
			prefix = rule.substr(rule.indexOf(label)-4, 4);
			if (prefix == 'not ')	// yes, this doesn't always apply, it's provisorically, lateron: lex yacc?
				return 'Inhibition';
			suffix = label.substr(label.length-3, 3);
			if (suffix == 'ase')
				return 'Catalysis';
			return 'Substrate';
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
				var line = input[index];
				if (line.length > 0 && line[0] != ' ') {	// non-empty line
					if (line[0] != '#') {			// update rule
						var s = line.split('=');
						if (s.length != 2)
							console.error('Error in BooleNet input file, line '+index+': Broken update rule')
						else	{
							var leftside = s[0];
							var rightside = BooleNet2BooleNetJS(s[1]).trim();

							if (leftside.indexOf('*') == -1 && (rightside != 'True' && rightside != 'False'))
								console.warn('Warning in BooleNet input file, line '+index+': Left side of update rule lacks obligatory asterisk');
							var targetNodeId = leftside.replace('*','').trim();
							var targetNode = network.getNodeById(targetNodeId);
							if (targetNode == null) {			// create target Node if it doesn't exist
								var targetNode = {};
								targetNode.id = targetNodeId;
								targetNode.data = {};
								targetNode.data.label = targetNodeId;
								targetNode.edges = [];
								network.appendNode(targetNode);
								targetNode.simulation = {
											myState : true, // default initial state
											update : true,
											updateRule : '',
											updateRulePy : ''
											};
//								console.log('+ target node '+network.nodes.length+': '+network.nodes[network.nodes.length-1].id);
								}
//							else	console.log('exists, not adding: '+targetNodeId);
							if (s[1].trim() == 'False')
								targetNode.simulation.myState = false; // initial state set explicitly
							else if (s[1].trim() != 'True')	{ // 'True' and 'False' are not update rules
								targetNode.simulation.updateRule = makeRule(rightside);
								targetNode.simulation.updateRulePy = s[0]+' = '+s[1].trim();
								}

							var sourceNodeIds = rightside.match(protein_name_regex);
//							console.log(rightside+' splits into '+rightside.match(protein_name_regex));
							for (idx in sourceNodeIds) {
								var sourceNodeId = sourceNodeIds[idx];
								if (sourceNodeId != "True" && sourceNodeId != "False") {
									var sourceNode = network.getNodeById(sourceNodeId);
									if (sourceNode == null) {			// create Node if it doesn't exist
										var sourceNode = {};
										sourceNode.id = sourceNodeId;
										sourceNode.data = {};
										sourceNode.data.label = sourceNodeId;
										sourceNode.edges = [];
										sourceNode.simulation = {
													myState: true,
													update: true,
													updateRule: ''
													};
										network.appendNode(sourceNode);
//										console.log('+ source node '+network.nodes.length+': '+network.nodes[network.nodes.length-1].id);
										}
//									else	console.log('exists, not adding: '+sourceNodeId);
								
									// create edge from source to target Node
									var edge = network.getEdgeBySourceAndTargetId(sourceNodeId, targetNodeId);
									if (edge == null) {
										var edge = {};
										edge.id = sourceNodeId+' -> '+targetNodeId;
										edge.source = sourceNodeId;
										edge.target = targetNodeId;
										edge.sourceNode = sourceNode;
										edge.targetNode = targetNode;
										edge.type = guessEdgeType(sourceNode.data.label, s[1]);
										sourceNode.edges.push(edge);
										targetNode.edges.push(edge);
										network.appendEdge(edge);
//										console.log('+ edge '+network.edges.length+': '+edge.id);
										}
//									else	console.log('exists, not adding: '+sourceNodeId+' -> '+targetNodeId);
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

