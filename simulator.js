
green = '#10d010';
red = '#d01010';
yellow = '#f4fd01';
black = '#000000';
blue = '#7474cf';

Simulator = function() {
		this.jSBGN = null;			// a reference to our network

		this.SVG = null;			// a reference to our SVG

		this.Nodes = [];			// references to the "simulator" dicts in every node of our jSBGN network

		this.running = false;
		this.updateSVG_Timeout = null;		// not null in case the Simulator is running

		this.colors = {
			active: green,
			inactive: '#ffffff',
			cyclic_attraktor: '#f9f883',
			};
	     }

Simulator.prototype.Initialize = function(jSBGN, SVG) {
					this.jSBGN = jSBGN;
					this.SVG = SVG;

					this.running = false;
					this.updateSVG_Timeout = null;

					this.initializeNodeIdDict();
					this.Nodes = [];

					for (n in this.jSBGN.nodes) {
						jSBGN_node = this.jSBGN.nodes[n];
						try {
							rule = this.jSBGN['BooleanUpdateRules'][jSBGN_node.id];	// jSBGN node id corresponds to SVG node title
							}
						catch(err) {
							rule = '';
							}
						SVG_node = document.getElementById(jSBGN_node.id.replace(' ', '_'));
						Node = {
							myElement: SVG_node,
							myState: false,
							myJSBGN: this.jSBGN, // a reference to it's parent
							update: true,
							updateRule: rule,
							};
						jSBGN_node['simulation'] = Node;
						this.Nodes = this.Nodes.concat([Node]); // append reference to array
						}
					this.installSVGonClickListeners();
					}

Simulator.prototype.initializeNodeIdDict = function() {
						this.nodeid_dict = {}
						for (n in this.jSBGN['nodes'])
							this.nodeid_dict[this.jSBGN['nodes'][n].id] = this.jSBGN['nodes'][n];
						}

Simulator.prototype.SVGonClick = function(event) {					// beware: this = SVGellipseElement
					debug('Node clicked. Refreshing graph ...');

					SVG_node = event.srcElement;


					this wird hier nicht funktionieren, weil das event asynchron kommt


					jSBGN_node = this.jSBGN.getNodeById(SVG_node.id);

					...



	//				alert(jSBGN_node.myState);
					if (!event.ctrlKey) {
	//					jSBGN_node.myState = ! jSBGN_node.myState	// change node state

						try {		// if an annotation is available for this node, show it
							annotation = network.annotations[SVG_node.id.replace('_',' ')];
							if (annotation == undefined || annotation == 'undefined')
								alert('not annotated')
							else	{
								document.getElementById('annotation_tab').innerHTML = '<h1>'+SVG_node.id+'</h1>'+annotation;
								showTab('annotation');
								}
						    }
						catch(err) {	// no annotation available
							alert('not annotated');
							}

						}
					else	{
						jSBGN_node.update = ! jSBGN_node.update;	// enable/disable updating of this node
						}
	//				alert(jSBGN_node.myState);

					if ( Simulator.updateSVG_Timeout == null ) {		// refresh SVG
						Simulator.updateSVG();
						}

					if ( ! Simulator.running ) {				// start Simulation
						document.getElementById('Steps').innerHTML = 0; // (but only if it's not running already)
						Simulator.Iterate();
						}
					}

Simulator.prototype.installSVGonClickListeners = function() {
							for (n in this.Nodes) {
								node = this.Nodes[n];
								if (node != null && node.myElement != null)
									node.myElement.onclick = this.SVGonClick;
								}
							}

Simulator.prototype.updateSVG = function() {
				if ( Simulator.updateSVG_Timeout != null ) {						// stop other updateSVG timeouts
					window.clearTimeout(Simulator.updateSVG_Timeout);
					Simulator.updateSVG_Timeout = null;
					}
				graph_refresh_required = false;
				for (n in Simulator.Nodes) {			// update color and dashing of all Nodes
					jSBGN_node = Simulator.Nodes[n];

					if (jSBGN_node != null && jSBGN_node.myElement != null) {
						// which color is this node currently fading to ?
						desired = Simulator.settings.colors.inactive;
						undesired = Simulator.settings.colors.active;
						if ( jSBGN_node.myState ) {
							temp = desired;
							desired = undesired;
							undesired = temp;
							}

						// continue fading
						current = jSBGN_node.myElement.getAttribute('fill');
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
						current = jSBGN_node.myElement.getAttribute('stroke-dasharray');
						if ( current != desired ) {
		//					graph_refresh_required = true;
							jSBGN_node.myElement.style['stroke-dasharray'] = desired;
							}
						}
					}
				if (graph_refresh_required)
					Simulator.updateSVG_Timeout = window.setTimeout('Simulator.updateSVG();', 20);	// update again in 20ms
				}

Simulator.prototype.Iterate = function() {
				Simulator.running = true;

				// messages
				e = document.getElementById('Progress');
				if ( e.innerHTML.length > 30 || e.innerHTML.substr(0,9) != 'Iterating' )
					e.innerHTML = 'Iterating ...'
				else	e.innerHTML = e.innerHTML+'.';
				steps = document.getElementById('Steps');
				steps.innerHTML = parseInt(steps.innerHTML)+1;

				// calculation
				changes = false;
				for (n in Simulator.Nodes) {
					jSBGN_node = Simulator.Nodes[n];
					if ( jSBGN_node.update ) {
						jSBGN_node.myNextState = Boolean(eval(jSBGN_node.updateRule));
						changes = changes || (jSBGN_node.myNextState != jSBGN_node.myState);
						}
					}

				// steady state ?
				if ( changes ) {			// network updated -> steady state not reached
					for (n in Simulator.Nodes) {
						jSBGN_node = Simulator.Nodes[n];					// State = NextState
						jSBGN_node.myState = jSBGN_node.myNextState;
						}
					try { delay=parseInt(document.getElementById('Delay').value);	}
					catch(err) { delay=120;	}
					if ( Simulator.updateSVG_Timeout == null ) Simulator.updateSVG();
					window.setTimeout('Simulator.Iterate();', delay);			// iterate again after delay
					}
				else 	{		// no changes -> steady state
	//				alert('no changes');
					Simulator.updateSVG();
					debug('Boolean network reached steady state.');
					Simulator.running = false;
					}
				}

