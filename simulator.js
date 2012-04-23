
green = '#10d010';
red = '#d01010';
yellow = '#f4fd01';
black = '#000000';
blue = '#7474cf';

getMySimulator = function(DOMelement) {
//			zu welchem SVG gehörst du?
//			im globalen object nachschauen
//			zugehörigen Simulator zurückgeben
			return simulator;
			}

Simulator = function() {
		this.jSBGN = null;			// a reference to our network

		this.SVG = null;			// a reference to our SVG

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
//					this.jSBGN.mySimulator = this;
					this.SVG = SVG;
//					this.SVG.mySimulator = this; // a ref for asynchronous calls

					this.running = false;
					this.updateSVG_Timeout = null;

					for (n in this.jSBGN.nodes) {
						var jSBGN_node = this.jSBGN.nodes[n];
						var SVG_node = document.getElementById(jSBGN_node.id.replace(' ', '_'));
						jSBGN_node.simulation.myElement = SVG_node;
						jSBGN_node.simulation.myJSBGN = this.jSBGN;
						}
					this.installSVGonClickListeners();
					}

SVGonClick = function(event) { // beware: this = SVGellipseElement
		console.log('Node clicked. Refreshing graph ...');

		var SVG_node = event.srcElement;
		var mySimulator = getMySimulator(SVG_node);
		var jSBGN_node = mySimulator.jSBGN.getNodeById(SVG_node.id);
		console.log('click. my state is '+jSBGN_node.simulation.myState);

		if (!event.ctrlKey) {
			if (mouseClick == 'simulation') {
				if (jSBGN_node.simulation.update) // change node state
					jSBGN_node.simulation.myState = ! jSBGN_node.simulation.myState;

				if ( ! mySimulator.running ) {    // evtl. start simulation
					document.getElementById('Steps').innerHTML = 0;
					Iterate(mySimulator.SVG.id);
					}
				}
			else if (mouseClick == 'annotation') {
				var annotation = jSBGN_node.simulation.annotation;
				if (annotation == undefined || annotation == 'undefined' || annotation == null || annotation == '') {
					if (confirm(jSBGN_node.id+' is not annotated. Annotate now?')) {
						text = prompt('Please enter annotation for '+jSBGN_node.id+':');
						if (text) {
							jSBGN_node.simulation.annotation = text;
							}
						}
					}
				else	{
					page = '<h1>'+SVG_node.id+'</h1>';
					page += '<div style="position:absolute; top: 10px; left: 50%; border: 1px dotted blue; background-color:'+mySimulator.colors.active+';">'+jSBGN_node.simulation.states[0]+'</p>';
					page += '<div style="position:absolute; top: 30px; left: 50%; border: 1px dotted blue; background-color:'+mySimulator.colors.inactive+';">'+jSBGN_node.simulation.states[1]+'</p>';
					page += '<br/>';
					page += annotation;
					document.getElementById('annotation_tab').innerHTML = page;
					showTab('annotation');
					}
				}
			}
		else	{
			jSBGN_node.simulation.update = ! jSBGN_node.simulation.update;	// enable/disable updating of this node
			}
//				alert(jSBGN_node.myState);

		if ( mySimulator.updateSVG_Timeout == null ) {		// refresh SVG
			updateSVG(mySimulator.SVG.id);
			}
		}

Simulator.prototype.installSVGonClickListeners = function() {
							for (n in this.jSBGN.nodes) {
								var node = this.jSBGN.nodes[n];
								if (node != null && node.simulation.myElement != null)
									node.simulation.myElement.onclick = SVGonClick;
								}
							}

updateSVG = function(id) {
		var mySimulator = getMySimulator(document.getElementById(id));

		if ( mySimulator.updateSVG_Timeout != null ) {						// stop other updateSVG timeouts
			window.clearTimeout(mySimulator.updateSVG_Timeout);
			mySimulator.updateSVG_Timeout = null;
			}
		var graph_refresh_required = false;
		for (n in mySimulator.nodes) {			// update color and dashing of all Nodes
			var jSBGN_node = mySimulator.nodes[n];

			if (jSBGN_node != null && jSBGN_node.myElement != null) {
				// which color is this node currently fading to ?
				var desired = mySimulator.colors.inactive;
				var undesired = mySimulator.colors.active;
				if ( jSBGN_node.myState ) {
					var temp = desired;
					var desired = undesired;
					var undesired = temp;
					}

				// continue fading
				var current = jSBGN_node.myElement.getAttribute('fill');
				if ( current.toLowerCase() != desired.toLowerCase() ) {
					var graph_refresh_required = true;
					jSBGN_node.myElement.setAttribute('fill', NextColor(undesired, current, desired));
					}

				// is this node updated or not? -> dashing?
				var desired = 'none';
				var undesired = '3,3';
				if ( ! jSBGN_node.update ) {
					var temp = desired;
					var desired = undesired;
					var undesired = temp;
					}
				var current = jSBGN_node.myElement.getAttribute('stroke-dasharray');
				if ( current != desired ) {
//					graph_refresh_required = true;
					jSBGN_node.myElement.style['stroke-dasharray'] = desired;
					}
				}
			}
		if (graph_refresh_required)
			mySimulator.updateSVG_Timeout = window.setTimeout('updateSVG("'+id+'");', 20); // update again in 20ms
		}

Iterate = function(id) {
		var mySimulator = getMySimulator(document.getElementById(id));

		mySimulator.running = true;

		// messages
		var e = document.getElementById('Progress');
		if ( e.innerHTML.length > 30 || e.innerHTML.substr(0,9) != 'Iterating' )
			e.innerHTML = 'Iterating ...'
		else	e.innerHTML = e.innerHTML+'.';
		var steps = document.getElementById('Steps');
		steps.innerHTML = parseInt(steps.innerHTML)+1;

		// calculation
		var changes = false;
		for (n in mySimulator.nodes) {
			var jSBGN_node = mySimulator.nodes[n];
			if ( jSBGN_node.update ) {
				jSBGN_node.myNextState = Boolean(eval(jSBGN_node.updateRule));
				var changes = changes || (jSBGN_node.myNextState != jSBGN_node.myState);
				}
			}

		// steady state ?
		if ( changes ) {			// network updated -> steady state not reached
			for (n in mySimulator.nodes) {
				var jSBGN_node = mySimulator.nodes[n];					// State = NextState
				jSBGN_node.myState = jSBGN_node.myNextState;
				}
			try { delay=parseInt(document.getElementById('Delay').value);	}
			catch(err) { delay=120;	}
			if ( mySimulator.updateSVG_Timeout == null )
				updateSVG();
			window.setTimeout('Simulator.Iterate("'+id+'");', delay);			// iterate again after delay
			}
		else 	{		// no changes -> steady state
			updateSVG(id);
			console.log('Boolean network reached steady state.');
			mySimulator.running = false;
			}
		}

Simulator.prototype.Iterate = function() {
				Iterate(this.SVG.id);
				}

