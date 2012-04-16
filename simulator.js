green = '#10d010';
red = '#d01010';
yellow = '#f4fd01';
black = '#000000';
blue = '#7474cf';

debug = function(msg) {
		document.getElementById('Progress').innerHTML = msg;
		}

Simulator = {
		jSBGN: null,				// a reference to our network

		SVG: null,				// a reference to our SVG

		Nodes: [],				// an array of references to the "Simulator" objects in every node in the jSBGN network

		running: false,
		updateSVG_Timeout: null,		// not null in case the Simulator is running

		settings: {
				colors: {
					active: green,
					inactive: '#ffffff',
					cyclic_attraktor: '#f9f883',
					},
			},

		Initialize: function (jSBGN, SVG) {
				this.jSBGN = jSBGN;
				this.SVG = SVG;

				this.running = false;
				this.updateSVG_Timeout = null;

				this.initializeNodeIdDict();
				this.Nodes = [];

				for (n in this.jSBGN['nodes']) {
					jSBGN_node = this.jSBGN['nodes'][n];
					rule = this.jSBGN['BooleanUpdateRules'][jSBGN_node.id];	// jSBGN node id corresponds to SVG node title
					if ( rule != 'undefined' ) {
						SVG_node = document.getElementById(jSBGN_node.id.replace(' ', '_'));
						Node = {
							myElement: SVG_node,
							myState: false,
							getState: this.getState,
							update: true,
							updateRule: rule,
							};
						jSBGN_node['simulation'] = Node;
						this.Nodes.push(Node);			// append reference to array
						}
					}
				this.installSVGonClickListeners();
				},

		initializeNodeIdDict: function() {
				this.nodeid_dict = {}
				for (n in this.jSBGN['nodes'])
					this.nodeid_dict[this.jSBGN['nodes'][n].id] = this.jSBGN['nodes'][n];
				},

		getNodeById: function(nodeid) {			// get jSBGN node
				return this.nodeid_dict[nodeid];
				},

		getState: function(nodeid) {
				return this.getNodeById(nodeid).simulation.myState;
				},

		SVGonClick: function(event) {					// beware: this = SVGellipseElement
				debug('Node clicked. Refreshing graph ...');

				SVG_node = event.srcElement;
				jSBGN_node = Simulator.getNodeById(SVG_node.id.replace('_', ' '));

				if (event.ctrlKey)
					jSBGN_node.myState = ! jSBGN_node.myState	// change node state
				else
					jSBGN_node.update = ! jSBGN_node.update;	// enable/disable updating of this node

				if ( Simulator.updateSVG_Timeout == null )		// refresh SVG
					Simulator.updateSVG();

				if ( ! Simulator.running ) {				// start Simulation
					document.getElementById('Steps').innerHTML = 0; // (but only if it's not running already)
					Simulator.Iterate();
					}

				debug('Graph refreshed.');
				},

		installSVGonClickListeners: function() {
				for (n in this.Nodes) {
					node = this.Nodes[n];
					node.myElement.onclick = this.SVGonClick;
					}
				},

		updateSVG: function() {
			graph_refresh_required = false;
			for (n in this.Nodes) {			// update color and dashing of all Nodes
				jSBGN_node = this.Nodes[n];

				// which color is this node currently fading to ?
				desired = this.settings.colors.inactive;
				undesired = this.settings.colors.active;
				if ( jSBGN_node.myState ) {
					temp = desired;
					desired = undesired;
					undesired = temp;
					}

				// continue fading
				current = jSBGN_node.getAttribute('fill');
				if ( current.toLowerCase() != desired.toLowerCase() ) {
					graph_refresh_required = true;
					jSBGN_node.myElement.setAttribute('fill', FadeColor(undesired, current, desired));
					}

				// is this node updated or not? -> dashing?
				desired = 'none';
				undesired = '3,3';
				if ( ! jSBGN_node.update ) {
					temp = desired;
					desired = undesired;
					undesired = temp;
					}
				current = JSBGN_node.myElement.getAttribute('stroke-dasharray');
				if ( current != desired ) {
//					graph_refresh_required = true;
					JSBGN_node.myElement.style['stroke-dasharray'] = desired;
					}
				}
			if ( this.updateSVG_Timeout != null ) {					// stop other updateSVG timeouts
				window.clearTimeout(this.updateSVG_Timeout);
				this.updateSVG_Timeout = null;
				}
			this.updateSVG_Timeout = window.setTimeout('updateSVG();', 20);		// update again in 20ms
			},

		Iterate: function() {
			this.running = true;

			// messages
			e = document.getElementById('Progress');
			if ( e.innerHTML.length > 30 || e.innerHTML.substr(0,9) != 'Iterating' )
				e.innerHTML = 'Iterating ...'
			else	e.innerHTML = e.innerHTML+'.';
			steps = document.getElementById('Steps');
			steps.innerHTML = parseInt(steps.innerHTML)+1;

			// calculation
			changes = false;
			for (n in this.Nodes) {
				jSBGN_node = this.Nodes[n];
				if ( jSBGN_node.update ) {
					jSBGN_node.myNextState = eval(jSBGN_node.updateRule);
					changes = changes || (jSBGN_node.myNextState != jSBGN_node.myState);
					}
				}

			// steady state ?
			if ( changes ) {	// network updated -> steady state not reached
				for (n in this.Nodes) {
					jSBGN_node = this.Nodes[n];				// State = NextState
					jSBGN_node.myState = jSBGN_node.myNextState;
					}
				try { delay=parseInt(document.getElementById('Delay').value);	}
				catch(err) { delay=120;	}
				if ( this.updateSVG_Timeout == null ) updateSVG();
				window.setTimeout('Iterate();', delay);				// iterate again after delay
				}
			else 	{		// no changes -> steady state
				updateSVG();
				debug('Boolean network reached steady state.');
				this.running = false;
				}
			},

		}; // Simulator

