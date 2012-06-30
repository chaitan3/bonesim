
Simulator = function(jsbgn, simDelay) {
  
  this.running = false;
  this.scopes = false;
  
  var obj = this;
  var net = jsbgn;
  var delay = simDelay;
    
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
      { state : exportStateJSON() }, 
      function (resp) {
        var newState = parseJSON(resp);
        console.log(JSON.stringify(newState));
        updateNodeRules(newState);
        iterate();
      });
    else
       iterate();
  }
  
  this.start = function() {
    obj.running = true;
    $('#simulation').unbind('click', obj.start);
    $('#simulation').click(obj.stop);
    $('#simulation').prop('value','Stop Simulation');
    obj.run();
  }

  this.stop = function() {
    obj.running = false;
    $('#simulation').unbind('click', obj.stop);
    $('#simulation').click(obj.start);
    $('#simulation').prop('value','Start Simulation');
  }

  var exportStateJSON = function() {	
    var state = new Object();
    for (i in net.nodes) {
      var node = net.nodes[i];
      if (node.simulation.update) {
        if(node.simulation.myState)
          state[node.id] = 1;
        else
          state[node.id] = 0;
      }
    }
    console.log(JSON.stringify(state));
    return JSON.stringify(state);
  }

  var updateNodeRules = function(state) {	
    for (i in net.nodes) {
      var node = net.nodes[i];
      if (nodes[i].simulation.update) {
        if(state[nodes[i].id])
          nodes[i].simulation.updateRule = (true).toString();
        else
          nodes[i].simulation.updateRule = (false).toString();
      }
    }
  }
  
  var makeRule = function(rule) {
    if (rule.trim() == 'True' || rule.trim() == 'False')
      return '';
    return rule.replace(protein_name_regex, 
    function(text) { 
      return "net.getNodeById('"+text+"').simulation.myState"; 
    });
  }


  var iterate = function() {
    var changed = [];
    for (idx in net.nodes) {
      var node = net.nodes[idx];
      if ( node.simulation.update && (node.simulation.updateRule.trim() != '')) {
        try	{
          node.simulation.myNextState = Boolean(eval(node.simulation.updateRule));
        }
        catch(err)	{
          console.error('Invalid update rule dropped, node '+node.id+': '+node.simulation.updateRule);
          node.simulation.updateRule = 'true';
        }
        if (node.simulation.myNextState != node.simulation.myState) {
          changed = changed.concat([node]);
        }
      }
    }
    if ( changed.length > 0 ) {   // network updated -> steady state not reached
      for (idx in changed) {
        var node = changed[idx];			// State = NextState
        node.simulation.myState = node.simulation.myNextState;
        nodeColorUpdate(node);
      }
      setTimeout(function() { obj.run() }, delay);		// iterate again
    }
    else 	{		// no changes -> steady state
      console.log('Boolean network reached steady state.');
      stop();
    }
  }
  
  var nodeClick = function(event) { 
    var node = net.getNodeById($(this).parent().attr('id'));
    var opacity;
    node.simulation.myState = !node.simulation.myState;
    nodeColorUpdate(node);
  }
  
  var nodeColorUpdate = function(node) {
    if (node.simulation.myState) 
      opacity = 1;
    else
      opacity = 0;
    node.simulation.myElement.animate({'fill-opacity':opacity}, delay);
  }
  
  for (n in net.nodes) {
    var node = net.nodes[n];
    node.simulation.updateRule = makeRule(node.simulation.updateRule);
    var svgNode = $('#' + node.id + ' :eq(0)');
    node.simulation.myElement = svgNode;
    if (svgNode != null) {
      svgNode.click(nodeClick);
      svgNode.css('fill', '#10d010');
      if (node.simulation.myState) 
        svgNode.css('fill-opacity', 1);
      else
        svgNode.css('fill-opacity', 0);
    }
  }
  $('#Steps').text = 0;
}
