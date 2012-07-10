
Simulator = function(jsbgn, simDelay) {
  
  this.running = false;
  this.scopes = false;
  
  var obj = this;
  var net;
  var delay;
  var ruleFunctions = new Object();
  
  this.init = function(jsbgn, simDelay) {
    net = jsbgn;
    delay = simDelay;
    net.states = new Object();
    
    $('#iteration').text(0);
    $('#simulation').click(this.start);
    $('#analyze').click(this.attractorSearch);
    if($('#sbml').attr('checked'))
      this.scopes = true;
      
    for (n in net.nodes) {
      var node = net.nodes[n];
      ruleFunctions[node.id] = makeFunction(net.rules[node.id]);
      if(!this.scopes) 
        net.states[node.id] = getInitialSeed();
      
      var svgNode = $('#' + node.id);
      if (svgNode != null) {
        svgNode.hover(nodeHoverRule, nodeHoverRemove);
        svgNode.click(nodeClick);
        nodeColorUpdate(node.id);
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
    $('#analyze').unbind('click', obj.attractorSearch);
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
      states[id] = ruleFunctions[id](net.states);
      if (states[id] !== net.states[id]) 
        changed.push(id);
    }
    for (i in changed) {
      id = changed[i];
      net.states[id] = states[id];
    }
    return changed;
  }
  
  var encodeMap = function(states) {  
    var map = 0, j = 0, i;  
    for (i in states) 
      map |= states[i] << j++;
    return map;  
  } 
  
  var decodeMap = function(map, states) {
    var newStates = new Object(), i, j = 0;
    for (i in states)
      newStates[i] = Boolean((map >> j++) & 1);
    return newStates;  
  }
  
  var randomColor = function() {
    var color = '#';
    for (i = 0; i < 6; i++) 
      color += Math.round(Math.random()*0xF).toString(16);
    return color;
  }

  this.attractorSearch = function() {
    var visitedStates = new Array();
    var attr, attractors = new Array(), color;
    var i, j, map, prev, idx, last;
    var doc = new sb.Document();
    doc.lang(sb.Language.AF);
    
    var initStates = new Array();
    for (i = 0; i < 30; i++) {
      initStates.push(new Object());
      for (j in net.states) {
        initStates[i][j] = Boolean(Math.round(Math.random()));
      }
    }
    
    for (i in initStates) {
      net.states = initStates[i];
      last = visitedStates.length;
      prev = -1;
      for(j = 0 ; ; j++) {
        map = encodeMap(net.states);
        idx = visitedStates.indexOf(map);
        if(idx !== -1) {
          if (idx >= last) {
            attr = new Object();
            attr.length = last + j - idx;
            attr.cycle = visitedStates.slice(idx);
            attractors.push(attr);
          }
          if (prev !== -1)
            //draw edge between map and prev map
            doc.createArc(prev + '->' + map).type(sb.ArcType.PositiveInfluence).source(String(prev)).target(String(map));
          break;
        }
        else {
          //create node with map
          doc.createNode(String(map)).type(sb.NodeType.SimpleChemical);
          
          if (prev !== -1)
            //draw edge between map and prev map
            doc.createArc(prev + '->' + map).type(sb.ArcType.PositiveInfluence).source(String(prev)).target(String(map));
        }
        visitedStates.push(map);
        sync();
        prev = map;
      }
    }
    //testing purposes
    var jsbgn = new jSBGN(); 
    var tmp = JSON.parse(sb.io.write(doc, 'jsbgn'));
    jsbgn.nodes = tmp.nodes;
    jsbgn.edges = tmp.edges;
    
    trans = importNetwork(jsbgn, '#stg');
    $('#tabs').tabs('select', '#stg');
    
    for (i in visitedStates)
      $('#' + visitedStates[i]).hover(nodeHoverStates, nodeHoverRemove);
    for (i in attractors) {
      attr = attractors[i];
      color = randomColor();
      for (j in attr.cycle)
        $('#' + attr.cycle[j] + ' :eq(0)').css('fill', color)
    }
    return attractors;
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
  
  var nodeClick = function() { 
    var id = $(this).attr('id');
    net.states[id] = !net.states[id];
    nodeColorUpdate(id);
    if($('#oneclick').attr('checked')) 
      obj.start();
  }
  
  var nodeHoverRule = function() {
    var id = $(this).attr('id');
    var rule = id + ' = ' + net.rules[id];
    $('<div/>', {id:'info', text: rule}).prependTo('#grn');
  }
  
  var nodeHoverStates = function() {
    var id = parseInt($(this).attr('id'));
    var states = decodeMap(id, net.states), i;
    var info = String();
    for (i in states)
      info += i + ': ' + states[i] + '<br>';
    $('<div/>', {id:'info', html: info}).prependTo('#stg');
  }
  
  var nodeHoverRemove = function() {
    $('#info').remove();
  }
  
  var nodeColorUpdate = function(id) {
    if (net.states[id]) 
      opacity = 1;
    else
      opacity = 0;
    $('#' + id + ' :eq(0)').css('fill', '#10d010').animate({'fill-opacity':opacity}, delay);
  }
}
