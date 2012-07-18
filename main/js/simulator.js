var trans, jSBGN;

var Simulator = function() {
  
  this.running = false;
  this.scopes = false;
  
  var obj = this;
  var net;
  var delay;
  var ruleFunctions = {};
  
  var makeFunction = function(rule) {
    rule = rule.replace(protein_name_regex, 
    function(text) { 
      if (text === 'true' || text === 'false')
        return text;
      return "states['" + text + "']"; 
    });
    return Function("states", "return " + rule + ";");
  };

  var sync = function() {
    var i, id;
    var changed = [];
    var states = {};
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
  };
  
  var encodeMap = function() {  
    var map = '', i;  
    for (i in net.states) 
      map += +net.states[i];
    return map;  
  };
  
  var decodeMap = function(map) {
    var newStates = {}, i, j = 0;
    for (i in net.states)
      newStates[i] =  Boolean(parseInt(map[j++], 10));
    return newStates;  
  };
  
  var randomColor = function() {
    var color = '#', i;
    for (i = 0; i < 6; i++) 
      color += Math.round(Math.random()*0xF).toString(16);
    return color;
  };
  
  var nodeColorUpdate = function(id) {
    var opacity;
    if (net.states[id]) 
      opacity = 1;
    else
      opacity = 0;
    $('#' + id + ' :eq(0)').css('fill', '#10d010').animate({'fill-opacity':opacity}, delay);
  };
  
  var iterate = function() {
    var changed, i;
    changed = sync();  
    if ( changed.length > 0 ) {   // network updated -> steady state not reached
      for (i in changed)
        nodeColorUpdate(changed[i]);
      setTimeout(function() { obj.run(); }, delay);		// iterate again
    }
    else {
      console.log('Boolean network reached steady state.');
      obj.stop();
    }
  };
  
  var nodeClick = function() { 
    var id = $(this).attr('id');
    net.states[id] = !net.states[id];
    nodeColorUpdate(id);
    if($('#oneclick').attr('checked')) 
      obj.start();
  };
  
  var nodeHoverRule = function() {
    var id = $(this).attr('id');
    var rule = id + ' = ' + net.rules[id];
    $('<div/>', {id:'info', text: rule}).prependTo('#grn');
  };
  
  var nodeHoverStates = function() {
    var id = parseInt($(this).attr('id'), 10);
    var states = decodeMap(id, net.states), i;
    var info = '';
    for (i in states)
      info += i + ': ' + states[i] + '<br>';
    $('<div/>', {id:'info', html: info}).prependTo('#stg');
  };
  
  var nodeHoverRemove = function() {
    $('#info').remove();
  };
  
  var applyGuessSeed = function() {
    
    $.ajax({
      url: env['biographer']+'/Simulate/InitialSeed',
      async: false,
      success: function(data) {
        var seed = JSON.parse(data);
        for (i in seed) {
          if(seed[i])
            net.states[i] = true;
          else
            net.states[i] = false;
        }
      }
    });
  }
  
  var exportStateJSON = function() {	
    var states = {}, i;
    for (i in net.nodes) {
      var node = net.nodes[i];
      if (net.rules[node.id].length === 0) {
        if(net.states[node.id])
          states[node.id] = 1;
        else
          states[node.id] = 0;
      }
    }
    return JSON.stringify(states);
  };

  var updateNodeRules = function(state) {	
    var i;
    for (i in state) {
      if(state[i])
        ruleFunctions[i] = function() { return true; };
      else
        ruleFunctions[i] = function() { return false; };
    }
  };
  
  this.init = function(jsbgn, simDelay, guessSeed) {
    net = jsbgn;
    delay = simDelay;
    net.states = {};
    
    $('#iteration').text(0);
    $('#simulation').click(this.start);
    $('#analyze').click(this.attractorSearch);
    
    var i;
    for (i in net.rules) {
      net.states[i] = getInitialSeed();
      if(this.scopes && net.rules[i].length !== 0)
        net.states[i] = false;
    }
    
    if(this.scopes && guessSeed)
      applyGuessSeed();
    
    var svgNode;  
    for (i in net.rules) {
      ruleFunctions[i] = makeFunction(net.rules[i]);
      svgNode = $('#' + i);
      if (svgNode !== null) {
        svgNode.hover(nodeHoverRule, nodeHoverRemove);
        svgNode.click(nodeClick);
        nodeColorUpdate(i);
      }
    }
  };
  
  this.run = function() {

    if(!(this.running))
      return;
      
    $('#iteration').text(parseInt($('#iteration').text(), 10) + 1);
      
    if (this.scopes)
      $.ajax({
        url: env['biographer']+'/Simulate/Iterate',
        type: 'POST',
        data: { state : exportStateJSON() },
        success: function (resp) {
          updateNodeRules(JSON.parse(resp));
          iterate();
        }
      });
    else
       iterate();
  };
  
  this.start = function() {
    obj.running = true;
    $('#simulation').unbind('click', obj.start);
    $('#simulation').click(obj.stop);
    $('#simulation').button( "option", "icons", {primary: 'ui-icon-pause'});
    $('#progress').show();
    obj.run();
  };

  this.stop = function() {
    obj.running = false;
    $('#simulation').unbind('click', obj.stop);
    $('#simulation').click(obj.start);
    $('#simulation').button( "option", "icons", {primary: 'ui-icon-play'});
    $('#progress').hide();
  };
  
  this.destroy = function() {
    $('#simulation').unbind('click', obj.start);
    $('#analyze').unbind('click', obj.attractorSearch);
  };
  
  this.attractorSearch = function() {
    var doc = new sb.Document();
    doc.lang(sb.Language.AF);
    
    var i, j;
    var initStates = [];
    for (i = 0; i < 30; i++) {
      initStates.push({});
      for (j in net.states) {
        initStates[i][j] = Boolean(Math.round(Math.random()));
      }
    }
    
    var cycle, attractors = [];
    var map, prev, node, idx;
    var currStates;
    for (i in initStates) {
      net.states = initStates[i];
      currStates = [];
      prev = '';
      for(j = 0 ; ; j++) {
        map = encodeMap(net.states);
        node = doc.node(map);
        if(node !== null) {
          idx = currStates.indexOf(map);
          if (idx !== -1) {
            cycle = currStates.slice(idx);
            attractors.push(cycle);
          }
          if (prev.length > 0)
            doc.createArc(prev + '->' + map).type(sb.ArcType.PositiveInfluence).source(prev).target(map);
          break;
        }
        else {
          doc.createNode(map).type(sb.NodeType.SimpleChemical);
          if (prev.length > 0)
            doc.createArc(prev + '->' + map).type(sb.ArcType.PositiveInfluence).source(prev).target(map);
        }
        currStates.push(map);
        sync();
        prev = map;
      }
    }
    
    var jsbgn = new jSBGN(); 
    var tmp = JSON.parse(sb.io.write(doc, 'jsbgn'));
    jsbgn.nodes = tmp.nodes;
    jsbgn.edges = tmp.edges;
    
    trans = importNetwork(jsbgn, '#stg');
    $('#tabs').tabs('select', '#stg');
    
    var color;
    for (i in jsbgn.nodes)
      $('#' + jsbgn.nodes[i].id).hover(nodeHoverStates, nodeHoverRemove);
    for (i in attractors) {
      cycle = attractors[i];
      color = randomColor();
      for (j in cycle)
        $('#' + cycle[j] + ' :eq(0)').css('fill', color);
    }
    
  };

  
};
