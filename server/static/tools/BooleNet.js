
BooleNet = {
	Import: function(input) {
			input = input.split('\n');
			var network = jSBGN;
			for (index in input) {
				var line = input[index];
				if (line.length > 0 && line[0] != ' ') {	// non-empty line
					if (line[0] != '#') {			// update rule
//						alert(line);
						}
					else	{				// comment or instruction
						if (line.indexOf('# States of ') == 0) {		// state description
							var colon = line.indexOf(':');
							var node = line.substring(12, colon);
							var Node = network.getNodeById(node);
							var setup = line.substring(colon+1);
							var a = setup.indexOf('"')+1;
							var b = setup.indexOf('"', a);
							var c = setup.indexOf('"', b+1)+1;
							var d = setup.indexOf('"', c);
							var True = setup.substring(a, b);
							var False = setup.substring(c, d);
							Node.simulation = {};
							Node.simulation.states = [True, False];
							}
						else if (line.indexOf('# Annotation of ') == 0) {	// annotation
							}
						}
					}
				}
			return network;
			}
	}

