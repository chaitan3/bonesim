
Simulator = function(jsbgn, simDelay) {
  
  this.running = false;
  this.scopes = false;
  
  var obj = this;
  var net;
  var delay;
  
  this.init = function(jsbgn, simDelay) {
    net = jsbgn;
    delay = simDelay;
    net.states = new Object();
    
    $('#iteration').text(0);
    $('#simulation').click(this.start);
    if($('#sbml').attr('checked'))
      this.scopes = true;
      
    for (n in net.nodes) {
      var node = net.nodes[n];
      net.rules[node.id] = makeFunction(net.rules[node.id]);
      if(!this.scopes) 
        net.states[node.id] = getInitialSeed();
      
      var svgNode = $('#' + node.id + ' :eq(0)');
      if (svgNode != null) {
        svgNode.click(nodeClick);
        svgNode.css('fill', '#10d010');
        if (net.states[node.id]) 
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
    var states = new Object();
    for (i in net.nodes) {
      var node = net.nodes[i];
      if (net.rules[node.id].length !== 0) {
        if(net.states[node.id])
          states[node.id] = 1;
        else
          states[node.id] = 0;
      }
    }
    console.log(JSON.stringify(states));
    return JSON.stringify(states);
  }

  var updateNodeRules = function(state) {	
    for (i in net.nodes) {
      var node = net.nodes[i];
      if (net.rules[node.id].length !== 0) {
        if(state[node.id])
          net.rules[node.id] = (true).toString();
        else
          net.rules[node.id] = (false).toString();
      }
    }
  }
  
  var makeFunction = function(rule) {
    rule = rule.replace(protein_name_regex, 
    function(text) { 
      if (text === 'true' || text === 'false')
        return text;
      return "states['" + text + "']"; 
    });
    return Function("states", "return " + rule + ";");
  }

  var sync = function() {
    var i, id;
    var changed = new Array();
    var states = new Object();
    for (i in net.nodes) {
      id = net.nodes[i].id;
      states[id] = net.rules[id](net.states);
      if (states[id] !== net.states[id]) 
        changed.push(id);
    }
    for (i in changed) {
      id = changed[i];
      net.states[id] = states[id];
    }
    return changed;
  }

  var steadyState = function() {
    var i;
    for (i in initStates) {
      
    }
  }

  var iterate = function() {
    var changed, i;
    changed = sync();  
    if ( changed.length > 0 ) {   // network updated -> steady state not reached
      for (i in changed)
        nodeColorUpdate(changed[i]);
      setTimeout(function() { obj.run() }, delay);		// iterate again
    }
    else 	{		// no changes -> steady state
      console.log('Boolean network reached steady state.');
      obj.stop();
    }
  }
  
  var nodeClick = function(event) { 
    var id = $(this).parent().attr('id');
    var opacity;
    net.states[id] = !net.states[id];
    nodeColorUpdate(id);
    
    if($('#oneclick').attr('checked')) 
      obj.start();
  }
  
  var nodeColorUpdate = function(id) {
    if (net.states[id]) 
      opacity = 1;
    else
      opacity = 0;
    $('#' + id + ' :eq(0)').animate({'fill-opacity':opacity}, delay);
  }
}
