
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
							console.error('Error in BooleNet, line '+index+': Broken update rule')
						else	{
							leftside = s[0];
							if (leftside.indexOf('*') == -1)
								console.warn('Warning in BooleNet, line '+index+': Left side of update rule lacks obligatory asterisk');
							targetNodeId = leftside.replace('*','').trim();
							// create Node if it doesn't exist
							
							rightside = s[1];
							sourceNodeIds = ... regulärer Ausdruck
							for (index in sourceNodeIds) {
								// add Node if it doesn't exist
								// add Edge from source to target Node
								}
							}
						}
					else	{				// comment or instruction
						if (line.indexOf('# States of ') == 0) {		// state description
							var colon = line.indexOf(':');
							var node = line.substring(12, colon);
							var Node = network.getNodeById(node);
							if (Node == null)
								console.error('Error in BooleNet, line '+index+': No such node: "'+node+'"')
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
								console.error('Error in BooleNet, line '+index+': No such node: "'+node+'"')
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

