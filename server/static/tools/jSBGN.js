
BooleNet = {
	Import: function(network) {
			network = network.split('\n');
			jSBGN = { nodes: {}, edges: {} };
			for (index in network) {
				line = network[index];
				if (line.length > 0 && line[0] != ' ') {	// non-empty line
					if (line[0] != '#') {			// update rule
//						alert(line);
						}
					else	{				// comment or instruction
						if (line.indexOf('# States of ') == 0) {		// state description
							colon = line.indexOf(':');
							node = line.substring(12, colon);
							setup = line.substring(colon+1);
							a = setup.indexOf('"')+1;
							b = setup.indexOf('"', a);
							c = setup.indexOf('"', b+1)+1;
							d = setup.indexOf('"', c);
							True = setup.substring(a, b);
							False = setup.substring(c, d);
							
							}
						else if (line.indexOf('# Annotation of ') == 0) {	// annotation
							}
						}
					}
				}
			return jSBGN;
			}
	}

