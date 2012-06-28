
Simulator = function(jSBGN, SVG) {
  this.jSBGN = jSBGN;
  this.SVG = SVG;
  this.running = false;
  this.updateSVG_Timeout = null;
  this.scopes = false;
  
  var obj = this;
  
  this.colors = {
    active: '#10d010',
    inactive: '#ffffff',
    cyclic_attraktor: '#f9f883',
  };
  
  this.run = function() {

    if(!this.running)
      return;
      
    var text = $('#Progress').text();
    if ( text.length > 30 || text.substr(0,9) != 'Iterating' )
      $('#Progress').text('Iterating ...');
    else	
      $('#Progress').text(text + '.');
    $('#Steps').text(parseInt($('#Steps').text()) + 1);
      
    if (this.scopes)
      $.post(env['biographer'] + '/Simulate/Iterate', 
      { state : this.exportStateJSON() }, 
      function (response) {
        var newState = parseJSON(response);
        console.log(JSON.stringify(newState));
        this.updateNodeRules(newState);
        this.iterate();
      });
    else
      this.iterate();
  }
  
  this.start = function() {
    obj.running = true;
    $('#simulation').unbind('click', obj.start);
    $('#simulation').click(obj.stop);
    $('#simulation').prop('value','Stop Simulation');
    console.log('Start Sim');
    obj.run();
  }

  this.stop = function() {
    obj.running = false;
    $('#simulation').unbind('click', obj.stop);
    $('#simulation').click(obj.start);
    $('#simulation').prop('value','Start Simulation');
    console.log('Stop Sim');
  }

  var exportStateJSON = function() {	
    var state = new Object();
    var nodes = this.jSBGN.nodes;
    for (i in nodes) {
      if (nodes[i].simulation.update) {
        if(nodes[i].simulation.myState)
          state[nodes[i].id] = 1;
        else
          state[nodes[i].id] = 0;
      }
    }
    console.log(JSON.stringify(state));
    return JSON.stringify(state);
  }

  var updateNodeRules = function(state) {	
    var nodes = this.jSBGN.nodes;
    for (i in nodes) {
      if (nodes[i].simulation.update) {
        if(state[nodes[i].id])
          nodes[i].simulation.updateRule = (true).toString();
        else
          nodes[i].simulation.updateRule = (false).toString();
      }
    }
  }

  var iterate = function() {
    
    var changed = [];
    for (idx in this.jSBGN.nodes) {
      var jSBGN_node = this.jSBGN.nodes[idx];
      if ( jSBGN_node.simulation.update && (jSBGN_node.simulation.updateRule.trim() != '')) {
        try	{
          jSBGN_node.simulation.myNextState = Boolean(eval(jSBGN_node.simulation.updateRule));
        }
        catch(err)	{
          console.error('Invalid update rule dropped, node '+jSBGN_node.id+': '+jSBGN_node.simulation.updateRule);
          jSBGN_node.simulation.updateRule = 'true';
        }
        var changes = changes || (jSBGN_node.simulation.myNextState != jSBGN_node.simulation.myState);
        if (jSBGN_node.simulation.myNextState != jSBGN_node.simulation.myState) {
          changed = changed.concat([jSBGN_node]);
        }
      }
    }
      
    if ( changed.length > 0 ) {   // network updated -> steady state not reached
      for (idx in changed) {
        var jSBGN_node = changed[idx];			// State = NextState
        jSBGN_node.simulation.myState = jSBGN_node.simulation.myNextState;
      }
      if ( this.updateSVG_Timeout == null )
        updateSVG();
      setTimeout(function() { obj.run() }, 500);		// iterate again
    }
    else 	{		// no changes -> steady state
      updateSVG();
      console.log('Boolean network reached steady state.');
      this.stop();
    }
  }

  var installSVGonClickListeners = function() {
							for (n in this.jSBGN.nodes) {
								var node = this.jSBGN.nodes[n];
								if (node != null && node.simulation.myElement != null)
									node.simulation.myElement.onclick = SVGonClick;
								}
							}

  
  for (n in this.jSBGN.nodes) {
    var jSBGN_node = this.jSBGN.nodes[n];
    var SVG_node = draws[jSBGN_node.id].nodeGroup().childNodes[0];
    jSBGN_node.simulation.myElement = SVG_node;
    if (SVG_node != null) {
      if (!jSBGN_node.simulation.myState) 
        jSBGN_node.simulation.myElement.style.fill=this.colors.inactive;
      else
        jSBGN_node.simulation.myElement.style.fill=this.colors.active;
    }
    jSBGN_node.simulation.myJSBGN = this.jSBGN;
  }
  this.installSVGonClickListeners();
  $('#Steps').text = 0;
  console.log(this);
}

showAnnotation = function(id) {
			// temporary workaround
			var mySimulator = simulator;

			var jSBGN_node = mySimulator.jSBGN.getNodeById(id);
			var page = '<label style="font-size: 30; font-weight: bold;">'+jSBGN_node.id+'</label>';
			var active = 'active';
			var inactive = 'inactive';
			if (jSBGN_node.simulation.states != undefined) {
				var active = jSBGN_node.simulation.states[0];
				var inactive = jSBGN_node.simulation.states[1];
				}
			page += '&nbsp;&nbsp;<div style="display: inline; padding: 5px; border: 1px dotted blue; background-color:'+mySimulator.colors.active+';">'+active+'</div>';
			page += '&nbsp;&nbsp;<div style="display: inline; padding: 5px; border: 1px dotted blue; background-color:'+mySimulator.colors.inactive+';">'+inactive+'</div>';
			page += '&nbsp;&nbsp;'+jSBGN_node.simulation.updateRulePy+'&nbsp;&nbsp;<input type=button value=Edit />';
			page += '<br/><br/>';
			page += jSBGN_node.simulation.annotation;
			document.getElementById('annotation_tab').innerHTML = page;

			showTab('annotation');
			}

SVGonClick = function(event) { // beware: this = SVGellipseElement

		var SVG_node = event.srcElement;
		var mySimulator = getMySimulator(SVG_node);
		var jSBGN_node = mySimulator.jSBGN.getNodeById(SVG_node.parentElement.id);

//		console.log('Node clicked: '+jSBGN_node.id);

		Simulate = function() {
				if ( ! mySimulator.running ) {
					document.getElementById('Steps').innerHTML = 0;
					Iterate(mySimulator.SVG.id);
					}
				}

		if (!event.ctrlKey) {
			if (typeof(mouseClick) == 'undefined')
				mouseClick = 'simulation';
			if (mouseClick == 'simulation') {
//				console.log(jSBGN_node.id+' = '+jSBGN_node.simulation.myState); // vorher

				jSBGN_node.simulation.myState = ! jSBGN_node.simulation.myState;

//				console.log(jSBGN_node.id+' = '+jSBGN_node.simulation.myState); // nachher

				//Simulate();
				}
			else if (mouseClick == 'annotation') {
				var annotation = jSBGN_node.simulation.annotation;
//				console.log('annotation of '+jSBGN_node.id+': '+annotation);

				showAnnotation(jSBGN_node.id);
				if (annotation == undefined || annotation == 'undefined' || annotation == null || annotation.trim() == '') {
/*					if (confirm(jSBGN_node.id+' is not annotated. Annotate now?')) {
						text = prompt('Please enter annotation for '+jSBGN_node.id+':');
						if (text) {
							jSBGN_node.simulation.annotation = text;
							showAnnotationTab();
							}
						}	*/
//					jSBGN_node.simulation.annotation = '<input type=button value="Annotate now" onclick="text = prompt(\'Please enter annotation for '+jSBGN_node.id+':\'); if (text) { jSBGN_node.simulation.annotation = text; showAnnotation('+jSBGN_node.id+'); }" />';
					jSBGN_node.simulation.annotation = '<iframe width="99%" height="85%" src="http://www.matthiasbock.net/wiki/index.php?title=Kategorie:Boole\'sche_Modellierung_des_Whi2p-abh%C3%A4ngigen_Signalweges"></iframe>';
					showAnnotation(jSBGN_node.id);
					}
				}
			}
		else	{
			jSBGN_node.simulation.update = ! jSBGN_node.simulation.update;	// enable/disable updating of this node
			Simulate();
			}
//				alert(jSBGN_node.myState);

		if ( mySimulator.updateSVG_Timeout == null ) {		// refresh SVG
			updateSVG(mySimulator.SVG.id);
			}
		}

updateSVG = function(id) {
    graph.suspendRedraw(1000);
		var mySimulator = simulator;

		if ( mySimulator.updateSVG_Timeout != null ) {						// stop other updateSVG timeouts
			window.clearTimeout(mySimulator.updateSVG_Timeout);
			mySimulator.updateSVG_Timeout = null;
			}

		var graph_refresh_required = false;
		for (n in mySimulator.jSBGN.nodes) {			// update color and dashing of all Nodes
			var jSBGN_node = mySimulator.jSBGN.nodes[n];
			
			if (jSBGN_node != null && jSBGN_node.simulation.myElement != null) {
				// which color is this node currently fading to ?
				var desired = mySimulator.colors.inactive;
				var undesired = mySimulator.colors.active;
				if ( jSBGN_node.simulation.myState ) {
					var temp = desired;
					var desired = undesired;
					var undesired = temp;
					}
				
				// continue fading
				//var current = jSBGN_node.simulation.myElement.getAttribute('fill');
				var current = jSBGN_node.simulation.myElement.style.fill;
        if ( current.toLowerCase() != desired.toLowerCase() ) {
					var graph_refresh_required = true;
          jSBGN_node.simulation.myElement.style.fill=NextColor(undesired, current, desired);
					//jSBGN_node.simulation.myElement.setAttribute('fill', NextColor(undesired, current, desired)); // Fading
//					jSBGN_node.simulation.myElement.setAttribute('fill', desired);
					}

				// is this node updated or not? -> dashing?
				var desired = 'none';
				var undesired = '3,3';
				if ( ! jSBGN_node.simulation.update ) {
					var temp = desired;
					var desired = undesired;
					var undesired = temp;
					}
				var current = jSBGN_node.simulation.myElement.getAttribute('stroke-dasharray');
				if ( current != desired ) {
//					graph_refresh_required = true;
					jSBGN_node.simulation.myElement.style['stroke-dasharray'] = desired;
					}
				}
			}
    graph.unsuspendRedraw();
		if (graph_refresh_required)
			mySimulator.updateSVG_Timeout = window.setTimeout('updateSVG("'+id+'");', 50); // update again in 20ms
		}
		





