
protein_name_regex = /[A-Za-z0-9_]+/g;

BooleNet = {
	Import: function(input) {
			input = input.split('\n');
			var network = jSBGN;
			for (index in input) {
				var line = input[index];
				if (line.length > 0 && line[0] != ' ') {	// non-empty line
					if (line[0] != '#') {			// update rule
						s = line.split('=');
						if (s.length != 2)
							console.error('Error in BooleNet input file, line '+index+': Broken update rule')
						else	{
							leftside = s[0];
							if (leftside.indexOf('*') == -1)
								console.warn('Warning in BooleNet input file, line '+index+': Left side of update rule lacks obligatory asterisk');
							targetNodeId = leftside.replace('*','').trim();
							targetNode = network.getNodeById(targetNodeId);
							if (targetNode == null) {			// create target Node if it doesn't exist
								targetNode = newNode();
								targetNode.id = targetNodeId;
								targetNode.data.label = targetNodeId;
								network.appendNode(targetNode);
								}
							
							rightside = s[1].replace_all(' and ', ' && ').replace_all(' or ', ' || ').replace_all(' not ', ' ! ');
							sourceNodeIds = rightside.match(protein_name_regex);
							for (index in sourceNodeIds) {
								sourceNodeId = sourceNodeIds[index];
								if (sourceNodeId != "True" && sourceNodeId != "False") {
									sourceNode = network.getNodeById(sourceNodeId);
									if (sourceNode == null) {			// create Node if it doesn't exist
										sourceNode = newNode();
										sourceNode.id = targetNodeId;
										sourceNode.data.label = targetNodeId;
										network.appendNode(sourceNode);
										}
								
									// create Edge from source to target Node
									Edge = network.getEdgeBySourceAndTargetId(sourceNodeId, targetNodeId);
									if (Edge == null) {
										Edge = newEdge();
										Edge.id = sourceNodeId+' -> '+targetNodeId;
										Edge.source = sourceNodeId;
										Edge.target = targetNodeId;
										Edge.sourceNode = sourceNode;
										Edge.targetNode = targetNode;
										sourceNode.edges.push(Edge);
										targetNode.edges.push(Edge);
										network.appendEdge(Edge);
										}
									}
								}
							}
						}
					else	{				// comment or instruction
						if (line.indexOf('# States of ') == 0) {		// state description
							var colon = line.indexOf(':');
							var node = line.substring(12, colon);
							var Node = network.getNodeById(node);
							if (Node == null)
								console.error('Error in BooleNet input file, line '+index+': No such node: "'+node+'"')
							else	{
								var setup = line.substring(colon+1);
								var a = setup.indexOf('"')+1;
								var b = setup.indexOf('"', a);
								var c = setup.indexOf('"', b+1)+1;
								var d = setup.indexOf('"', c);
								var True = setup.substring(a, b);
								var False = setup.substring(c, d);
								if (typeof(Node.simulation) === 'undefined')
									Node.simulation = {};
								Node.simulation.states = [True, False];
								}
							}
						else if (line.indexOf('# Annotation of ') == 0) {	// annotation
							var colon = line.indexOf(':');
							var node = line.substring(16, colon);
							var Node = network.getNodeById(node);
							if (Node == null)
								console.error('Error in BooleNet input file, line '+index+': No such node: "'+node+'"')
							else	{
								var setup = line.substring(colon+1);
								var a = setup.indexOf('"')+1;
								var b = setup.indexOf('"', a);
								var annotation = line.substring(a, b);
								if (typeof(Node.simulation) === 'undefined')
									Node.simulation = {};
								Node.simulation.annotation = annotation;
								}
							}
						}
					}
				}
			return network;
			}
	}

