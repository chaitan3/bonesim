
Simulator = function(jsbgn, simDelay) {
  
  this.running = false;
  this.scopes = false;
  
  var obj = this;
  var net;
  var delay;
  
  this.init = function(jsbgn, simDelay) {
    net = jsbgn;
    delay = simDelay;
    
    $('#iteration').text(0);
    $('#simulation').click(this.start);
    if($('#sbml').attr('checked'))
      this.scopes = true;
      
    for (n in net.nodes) {
      var node = net.nodes[n];
      
      if(!this.scopes) 
        node.simulation = {
          updateRule: makeRule(net.rules[node.id]),
          myState: getInitialSeed(),
          update: true
        }
      
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
  }
    
  this.run = function() {

    if(!(this.running))
      return;
      
    $('#iteration').text(parseInt($('#iteration').text()) + 1);
      
    if (this.scopes)
      $.ajax({
        url: env['biographer']+'/Simulate/Iterate',
        type: 'POST',
        data: { state : exportStateJSON() },
        success: function (resp) {
          var newState = JSON.parse(resp);
          console.log(JSON.stringify(newState));
          updateNodeRules(newState);
          iterate();
        }
      });
    else
       iterate();
  }
  
  this.start = function() {
    obj.running = true;
    $('#simulation').unbind('click', obj.start);
    $('#simulation').click(obj.stop);
    $('#simulation').button( "option", "icons", {primary: 'ui-icon-pause'});
    $('#progress').show();
    obj.run();
  }

  this.stop = function() {
    obj.running = false;
    $('#simulation').unbind('click', obj.stop);
    $('#simulation').click(obj.start);
    $('#simulation').button( "option", "icons", {primary: 'ui-icon-play'});
    $('#progress').hide();
  }
  
  this.destroy = function() {
    $('#simulation').unbind('click', obj.start);
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
      if (node.simulation.update) {
        if(state[node.id])
          node.simulation.updateRule = (true).toString();
        else
          node.simulation.updateRule = (false).toString();
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
      obj.stop();
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
}
