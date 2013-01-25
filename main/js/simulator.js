var serverURL, controls;

/** 
 * The Simulator class represents the network, it's current state and also
 * it's update rules. It also contains private and privileged functions
 * to run the simulator, find attractors and plot the time series graph.
 * @constructor
 */
var Simulator = function() {
  // Public variables
  this.running = false;
  this.scopes = false;
  
  // Private variables
  // Holds the current scope (simulator)
  var obj = this;
  // Settings for the simulator
  var config;
  
  // Network and update rules
  var net;
  var ruleFunctions = {};
  
  // Track the number of iterations and the plot
  var iterationCount = 0;
  var plot = null;
  var plotH = 20;
  var plotW = 100;
  
  /**
   * Convert the update rule to a function. This is done by matching all 
   * the node ids and replacing them with the state variable equivalents.
   * @param {string} rule The update rule.
   * @returns {Function} The function for the update rule.
   */
  var makeRuleFunction = function(rule) {
    // Match the node ids
    var newRule = rule.replace(/[A-Za-z0-9_]+/g, function(text) { 
      if (text === 'true' || text === 'false')
        return text;
      return "state['" + text + "']"; 
    });
    // Create the function passing the current state as the first parameter
    return Function("state", "return " + newRule + ";");
  };
  
  /**
   * Get the guess seed generated by libscopes from the server. A 
   * synchronous request is sent and the JSON data is parsed to the state
   * variable.
   */
  var applyGuessSeed = function() {
    $.ajax({
      url: serverURL + '/Simulate/InitialSeed',
      async: false,
      success: function(data) {
        var seed = JSON.parse(data), i;
        for (i in seed) {
          if (seed[i])
            net.state[i] = true;
          else
            net.state[i] = false;
        }
      }
    });
  };
  
  /**
   * Update the color of a node after every iteration. The jQuery's
   * animate applied on the opacity of the node provides the fancy animation. 
   * @param {string} id The node id.
   */
  var updateNodeColor = function(id) {
    var opacity;
    if (net.state[id]) 
      opacity = 1;
    else
      opacity = 0;
      
    $('#' + id + ' :eq(0)').css('fill', '#10d010')
      .animate({'fill-opacity':opacity}, config.simDelay);
  };
  
  /**
   * The event handler for clicking the Update rule button of the edit
   * rule dialog box. The corresponding update rule function is updated.
   */
  var updateRule = function() {
    var rule = $('#textRule').val();
    var id = $('#textID').text();
    // Update the rule and it's corresponding function
    net.rules[id] = rule;
    ruleFunctions[id] = makeRuleFunction(net.rules[id]);
    
    $('#buttonEdit').unbind('click', updateRule);
    $('#dialogEdit').dialog('close');
  };
  
  /**
   * The event handler for right clicking a node. Opens the Edit rule
   * dialog box.
   * @param {Event} event The event object.
   */
  var editNodeRule = function(event) {
    event.preventDefault();
    
    var id = $(this).attr('id');
    $('#textID').text(id);
    $('#textRule').val(net.rules[id]);
    $('#buttonEdit').click(updateRule);
    $('#dialogEdit').dialog('open');
  };
  
  /**
   * The event handler for left clicking a node. The node state is toggled.
   */
  var toggleNodeState = function() { 
    
    var id = $(this).attr('id');
    // Toggle the node state
    net.state[id] = !net.state[id];
    updateNodeColor(id);
    
    //Update the value in the plot
    iterationCount += 2;
    createStateColumn(net.state);
    
    // Start the simulation if the One click option is checked
    if (config.oneClick && !obj.running) 
      setTimeout(function() { obj.start(); }, config.simDelay);
  };
  
  /**
   * The event handler for hovering over a node. Displays the update rule
   * of a node.
   */
  var showRuleBox = function() {
    var id = $(this).attr('id');
    var rule = id + ' = ' + net.rules[id];
    // Create the info box
    $('<div/>', {id:'boxInfo', text: rule}).prependTo('#graphNetwork');
  };
  
  /**
   * The event handler for unhovering a node. The info box is deleted.
   */
  var removeInfoBox = function() {
    $('#boxInfo').remove();
  };
  
  /**
   * Generate a random color. The format is a 6 digit hex prefixed by a 
   * hash symbol.
   * @returns {string} The random color.
   */
  var getRandomColor = function() {
    var color = '#', i;
    // Get 6 random characters in hex
    for (i = 0; i < 6; i++) 
      color += Math.round(Math.random()*0xF).toString(16);
    return color;
  };
  
  /**
   * Construct the node label column
   * @param {Object} state Current state of the network.
   */
  var createNodesColumn = function(state) {
    var yPos = 0;
    
    for (i in state) {
      plot.append('svg:text').attr('y', function(d) { return yPos; })
          .attr('dx', 10).attr('dy', 15)
          .text(i)
          .attr('id', 'label' + i);
          
      // Get the width of the text and find maximum
      var width = d3.select('#label' + i).node().getBBox()['width'];
      if (width > plotW)
        plotW = width + 50;
      yPos += plotH;
    }  
    // Resize SVG
    plot.attr('height', yPos + 50);
  }
  
  /**
   * Construct a column with all the states.
   * @param {Object} state Current state of the network.
   */
  var createStateColumn = function(state) {
    var maxColumns = 40;
    
    // Calculate position of the column
    var yPos = 0, xPos = plotW + (iterationCount % maxColumns) * plotH; 
    var color;
    
    // Replace previous column
    removeStateColumn(iterationCount - maxColumns);
    
    for (i in state) {
      if (state[i]) color = 'red'; else color = 'green';
      // Add a rectangle of required color
      plot.append('svg:rect').attr('y', function(d) { return yPos; }).attr('x', xPos)
          .attr('height', plotH).attr('width', plotH)
          .attr('fill', color)
          .attr('class', iterationCount);
      yPos += plotH;
    }  
    // Iteration count text on the bottom
    plot.append('svg:text').attr('y', function(d) { return yPos; }).attr('x', xPos)
          .attr('dx', 5).attr('dy', 15)
          .attr('class', iterationCount)
          .text(iterationCount);
    // Add the marker for current iteration
    plot.append('svg:rect').attr('height', yPos).attr('width', 7)
          .attr('id', 'currMarker')
          .attr('x', xPos + plotH);      
  }
  
  /**
   * Delete a column before replacing it.
   * @param {number} index The index of the column to be deleted.
   */
  var removeStateColumn = function(index) {
    $('rect.' + index).remove();
    $('text.' + index).remove();
    d3.selectAll('#currMarker').remove();
  }
  /**
   * Create the Heatmap Plotter. 
   */
  this.createPlotter = function() {
    
    if (plot !== null)
      return;
    
    // Clear any previous plots
    $('#plotTimeSeries > svg').remove();
    
    // Use d3 to create the initial svg with the start states
    plot = d3.select('#plotTimeSeries').append('svg:svg');
    createNodesColumn(net.state);
    createStateColumn(net.state);
  };
  
  /**
   * Initialise the simulator. The initial states are calculated, the 
   * plotter is created and all the event handlers for the nodes are 
   * applied.
   * @param {jSBGN} jsbgn The network represented as a jSBGN object.
   * @param {number} simDelay The delay between successive iterations.
   * @param {Boolean} guessSeed Truth value for whether the guess seed for
   * SBML files should be applied.
   */
  this.initialise = function(jsbgn, settings) {
    net = jsbgn;
    config = settings;
    net.state = {};
    
    console.log('Initialising simulator');
    
    $('#buttonSimulate').click(this.start);
    $('#buttonAnalyse').click(this.search);
    
    // Initialise the state of the network
    var i;
    for (i in net.rules) {
      if (net.rules[i].length !== 0)
        net.state[i] = controls.getInitialSeed();
    }
    if (this.scopes && config.guessSeed)
      applyGuessSeed();
    
    var svgNode;  
    for (i in net.state) {
      ruleFunctions[i] = makeRuleFunction(net.rules[i]);
      // Get the node in the SVG and bind the event handlers
      svgNode = $('#' + i);
      if (svgNode !== null) {
        if (!this.scopes) {
          svgNode.hover(showRuleBox, removeInfoBox);
          svgNode.bind('contextmenu', editNodeRule);
        }
        svgNode.click(toggleNodeState);
        updateNodeColor(i);
      }
    }
  };
  
  /**
   * Calculate the new state of the network using the update rules.
   * The node state is updated synchronously in the sense that the update
   * rule is calculated using the previous iteration's state. Only after
   * calculating all the new states, the state variable is updated.
   * @returns {Array} A list of the changed nodes.
   */
  var synchronousUpdate = function(state) {
    var i, id;
    var changed = [];
    var newState = {};
    
    // Get the new states by calling the respective update rule functions
    for (i in net.state) {
      newState[i] = ruleFunctions[i](state);
      if (newState[i] !== state[i]) 
        changed.push(i);
    }
    // The update the synchronous, the state is updated only after all
    // the new states are calculated
    for (i in changed) {
      id = changed[i];
      state[id] = newState[id];
    }
    return changed;
  };
  
  /**
   * Run a single iteration. Call the run function after completing an
   * iteration. The node color is updated using an animation.
   */
  var singleIteration = function() {
    var changed, i;
    changed = synchronousUpdate(net.state);  
    
    // Update the node colors after an iteration and call run again if
    // the Simulation has not reached steady state
    if (changed.length > 0) {  
      for (i in changed)
        updateNodeColor(changed[i]);
      setTimeout(function() { obj.run(); }, config.simDelay);	
    }
    else {
      console.log('Boolean network reached steady state.');
      obj.stop();
    }
  };
  
  /**
   * Export all states to JSON. Required for the simulation of SBML files
   * using libscopes on the server.
   * @param {Array} states A list of the states which have to exported.
   * @returns {string} The JSON string for the exported states.
   */
  var exportStateJSON = function(states) {	
    var i, j;
    var exportStates = [];
    // Loop over all states and convert Boolean to 0/1 for the Python
    // libscopes library
    for (i in states) {
      exportStates.push({});
      for (j in states[i]) {
        if (states[i][j])
          exportStates[i][j] = 1;
        else
          exportStates[i][j] = 0;
      }
    }
    return JSON.stringify(exportStates);
  };
  
  /**
   * Create temporary update rule functions for the new state of the 
   * network as returned by the server for SBML files.
   * @param {Object} state The state of the network as calculated by libscopes.
   */
  var updateNodeRules = function(state) {	
    var i;
    for (i in state) {
      if (state[i])
        ruleFunctions[i] = function() { return true; };
      else
        ruleFunctions[i] = function() { return false; };
    }
  };
  
  /**
   * Executes the simulator. Time series plots updated and libscopes
   * server side iteration called if required.
   */
  this.run = function() {
    if (!(this.running))
      return;

    // Get the next states from the current state, contact server if required  
    if (this.scopes) {
      $.ajax({
        url: serverURL + '/Simulate/Iterate',
        type: 'POST',
        data: { state : exportStateJSON([net.state]) },
        success: function (resp) {
          updateNodeRules(JSON.parse(resp));
          singleIteration();
        }
      });
    }
    else
       singleIteration();
    
    $('#textIteration').text(++iterationCount);   
    if (plot !== null)
      createStateColumn(net.state);
    
  };
  
  /**
   * Generate a map for the state of the network.
   * @param {Object} state The state of the network.
   * @return {string} A map of the state of the network
   */
  var encodeStateMap = function(state) {  
    var map = '', i;  
    for (i in state) 
      map += +state[i];
    return map;  
  };
  
  /**
   * Decode the map of the state of the network
   * @param {string} map The map of the state of the network
   * @returns {Object} The state of the network
   */
  var decodeStateMap = function(map) {
    var state = {}, i, j = 0;
    for (i in net.state)
      state[i] =  Boolean(parseInt(map[j++], 10));
    return state;  
  };
  
  /**
   * Get some random initial states, used by the attractorSearch function.
   * @returns {Array} A list of states
   */
  var getInitStates = function() {
    var i, j;
    var initStates = [];
    for (i = 0; i < 30; i++) {
      initStates.push({});
      for (j in net.state) {
        initStates[i][j] = Boolean(Math.round(Math.random()));
      }
    }
    return initStates;
  };
  
  /**
   * The event handler for hovering over a node. Displays The state 
   * defined by the node for the network.
   */
  var showStateBox = function() {
    var id = $(this).attr('id');
    // Get the state from the node id which is a map
    var state = decodeStateMap(id), i;
    var info = '';
    for (i in state)
      info += i + ': ' + state[i] + '<br>';
      
    // Generate the info box
    $('<div/>', {id:'boxInfo', html: info}).prependTo('#graphStateTransition');
  };
  
  /**
   * Assign the state defined by the node in the State transition graph
   * to the nodes in the Network graph.
   */
  var copyStateNetwork = function() {
    var id = $(this).attr('id'), i;
    net.state = decodeStateMap(id);
    for (i in net.state)
      updateNodeColor(i);
  };
  
  /**
   * Import the generated Attractor network into the State Transition Graph.
   * The d3 force layouter is applied to the graph, event handlers are
   * bound for each node and the attractors are colored.
   * @param {sb.Document} doc The SBGN document for the graph.
   * @param {Array} attractors A list of attractors of the graph.
   */
  var drawAttractors = function(doc, attractors) {
    
    // Convert the SBGN document to jSBGN
    var jsbgn = new jSBGN(); 
    var tmp = JSON.parse(sb.io.write(doc, 'jsbgn'));
    jsbgn.nodes = tmp.nodes;
    jsbgn.edges = tmp.edges;
    
    // Import the State transition graph into a bui.Graph instance
    controls.importNetwork(jsbgn, '#graphStateTransition');
    
    // Bind the event handlers for the node
    var i, id;
    for (i in jsbgn.nodes) {
      id = '#' + jsbgn.nodes[i].id;
      $(id).hover(showStateBox, removeInfoBox);
      $(id).click(copyStateNetwork);
    }
    // Color all the attractors with a unique color for each attractor
    var cycle, j, color;
    for (i in attractors) {
      cycle = attractors[i];
      color = getRandomColor();
      for (j in cycle)
        $('#' + cycle[j] + ' :eq(0)').css('fill', color);
    }
  };
  
  /**
   * Calculate the attractors for the network graph and display a state
   * transition graph. The algorithm used is quite a simple one. 
   * For each initial state successive states are calculated and the nodes
   * (representing the state of the network) are added to the graph, 
   * and if a ndoe is repeated a edge is created and the next initial 
   * state is chosen.
   */
  this.search = function() {
    var doc = new sb.Document();
    doc.lang(sb.Language.AF);
    
    var i, j;
    var initStates = getInitStates();
    
    // Get the new states of the network imported from SBML files by
    // using libscopes running on the server
    if (obj.scopes) {
      var statesList;
      $.ajax({
        url: serverURL + '/Simulate/AttractorSearch',
        type: 'POST',
        async: false,
        data: { states : exportStateJSON(initStates) },
        success: function (resp) {
          // The new state list for all the initial states
          statesList = JSON.parse(resp);
        }
      });
    }
    
    // Loop over all the initial states to find the attractors
    var cycle, attractors = [];
    var map, prev, node, idx;
    var currStates, state;
    
    for (i in initStates) {
      state = initStates[i];
      currStates = [];
      prev = '';
      // Run the iterations for each initial state
      for (j = 0 ; ; j++) {
        // A map is used to match two states, faster than directly
        // comparing the objects
        map = encodeStateMap(state);
        node = doc.node(map);
        // If the map does not exist in the graph document, create it
        if (node !== null) {
          idx = currStates.indexOf(map);
          // If the map already exists in the visited node array it means
          // that we have found a attractor
          if (idx !== -1) {
            cycle = currStates.slice(idx);
            attractors.push(cycle);
          }
          // Create the connecting arc for the state transition graph
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
        if (obj.scopes)
          updateNodeRules(statesList[i][j + 1]);
        // Get the new states
        synchronousUpdate(state);
        prev = map;
      }
    }
    
    drawAttractors(doc, attractors);
  };
  
  
  /**
   * Export the update rules to a R BoolNet file. Take care of the 
   * difference is logical operators between JS and R.
   * @returns {string} The R BoolNet file data.
   */
  this.exportRBoolNet = function() {
    var rbn = 'targets, factors\n';
    var i, r;
    
    // Replace the JS logical operators with those of R for each update
    // rule
    for (i in net.rules) {
      r = net.rules[i].replace(/&&/g, '&').replace(/\|\|/g, '|')
        .replace(/true/g, 'TRUE').replace(/false/g, 'FALSE');
      rbn += i + ', ' + r + '\n';
    }
    return rbn;
  };
  
  /**
   * Export the update rules to a Python BooleanNet file. Take care of the 
   * difference is logical operators between JS and Python.
   * @returns {string} The Python BooleanNet file data.
   */
  this.exportPythonBooleanNet = function() {
    var pbn = '';
    var i, r;
    
    // Replace the JS logical operators with those of Python for each update
    // rule
    for (i in net.rules) {
      r = net.rules[i].replace(/&&/g, 'and').replace(/\|\|/g, 'or')
        .replace(/true/g, 'True').replace(/false/g, 'False')
        .replace(/[!]/g, 'not');
      pbn += i + '* = ' + r + '\n';
    }
    return pbn;
  };
  
  /**
   * Start the simulator. Bind/unbind the event handlers.
   */
  this.start = function() {
    // Update the variable tracking whether the simulator is running or not
    obj.running = true;
    $('#buttonSimulate').unbind('click', obj.start);
    $('#buttonSimulate').click(obj.stop);
    $('#buttonSimulate').button( "option", "icons", {primary: 'ui-icon-pause'});
    $('#circleProgress').show();
    $('#tabs').tabs('select', '#graphNetwork');
    // Start the simulation
    obj.run();
  };

  /**
   * Stop the simulator. Bind/unbind the event handlers.
   */
  this.stop = function() {
    obj.running = false;
    $('#buttonSimulate').unbind('click', obj.stop);
    $('#buttonSimulate').click(obj.start);
    $('#buttonSimulate').button( "option", "icons", {primary: 'ui-icon-play'});
    $('#circleProgress').hide();
  };
  
  /**
   * Destroy the simulator. All the event handlers are unbound.
   */
  this.destroy = function() {
    $('#buttonSimulate').unbind('click', obj.start);
    $('#buttonAnalyse').unbind('click', obj.search);
  };
};
