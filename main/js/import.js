
/**Representation of Graphs using nodes and edges arrays. Used as
 * a placeholder for importing graphs into biographer-ui. Graphs are 
 * exported to this format by using the libSBGN.js library. Also 
 * hosts the layout function for the network.
 * @constructor
 */
var jSBGN = function () { 
  this.nodes = [];
  this.edges = [];
};

/**After generating the layout, the jSBGN object contains the x and y 
 * coordinates of the nodes. These are imported into the bui graph by
 * using this function.
 * @param {bui.Graph} graph The bui graph instance.
 */
jSBGN.prototype.redraw = function (graph) {
  var all_drawables = graph.drawables();
  var i, j;
  //Node positions updated first
  for (i = 0; i < this.nodes.length; i++) {
    j = this.nodes[i];
    all_drawables[j.id].absolutePositionCenter(j.x, j.y);
  }
  //Recalculating edges coordinates based on the new nodes coordinates
  for (i = 0; i < this.edges.length; i++) {
    j = this.edges[i];
    all_drawables[j.id].recalculatePoints();
  }
};

/**Function to substitute the node id's in source and target properties 
 * of edges with the actual node objects, this is required for the d3
 * layouter
 */
jSBGN.prototype.connect = function () {
  var i, j;
  for (i in this.edges) {
    for (j in this.nodes) {
      if (this.edges[i].source == this.nodes[j].id)
        this.edges[i].source = this.nodes[j];
      if (this.edges[i].target == this.nodes[j].id)
        this.edges[i].target = this.nodes[j];
    }
  }
};

/**The d3 layouter. Customised for better graphs with networks and 
 * transitions.
 * @param {bui.Graph} graph The bui graph instance.
 */          
jSBGN.prototype.layout = function(graph) {
  //Give a canvas to the d3 layouter with the dimensions of the window
  var ratio = $(window).width()/$(window).height();
  var w = 1e6;
  var h = w / ratio;
  var force = d3.layout.force()
    /*.charge(-2000)
    .linkDistance(100)
    .linkStrength(1)
    .gravity(0.1)*/
    
    /*.charge(-3500)
    .linkDistance(150)
    .linkStrength(0.5)
    .gravity(0.05)
    .nodes(this.nodes)
    .links(this.edges)
    .size([w, h]);*/
    
    .charge(function(node) { 
              var size = 0;
              if(typeof(node.data.label) !== 'undefined')
                size = node.id.length;
              return -2000-500*size; 
            })
    .linkDistance(function(edge) { 
                    var size = 0;
                    if(typeof(edge.source.data.label) !== 'undefined')
                      size = edge.source.id.length + edge.target.id.length;
                    return 100 + 30*(edge.source.weight) + 5*size; 
                  })
    .linkStrength(1)
    .gravity(0.1)
    .nodes(this.nodes)
    .links(this.edges)
    .size([w, h]);
  //Run the d3 layouer, alpha cut-off 0.005
  force.start();
  while(force.alpha() > 0.005)
    force.tick();
  force.stop();
};

jSBGN.prototype.importSBML = function(file) {
  var obj = this;
  
  var formData = new FormData();
  formData.append('file', file);
  $.ajaxSetup({
    cache: false,
    async: false
  });
  
  $.ajax({
    url: serverURL + '/Put/UploadSBML',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function() {
      $.get(serverURL + '/Get/processedSBML', 
        function(data) {
          var json = JSON.parse(data);
          obj.nodes = json.nodes;
          obj.edges = json.edges;
          obj.rules = {};
          
          var i;
          for (i in obj.nodes) {
            var node = obj.nodes[i];
            
            if ((node.type == 'Compartment') || (node.type == 'Process'))
              obj.rules[node.id] = '';
            else
              obj.rules[node.id] = 'update';
          }
        }
      );
    }
  });
  
  $.ajaxSetup({
    async: true
  });
};

jSBGN.prototype.importGINML = function(file) {
  //todo 
  //add visual setting importers, taken care by layout currently
  //boolean only supported that is maxval = 1
  
  var xml = $.parseXML(file);
  var nodes = $(xml).find('node');
  var edges = $(xml).find('edge');
  
  var doc = new sb.Document();
  doc.lang(sb.Language.AF);
  
  var id;
  $(nodes).each(function() {
    id = $(this).attr('id');
    doc.createNode(id).type(sb.NodeType.Macromolecule).label(id);
  });
  
  $(edges).each(function() {
    var sign, type;
    id = $(this).attr('id');
    sign = $(this).attr('sign');
    if (typeof(sign) !== 'undefined') {
      if (sign === 'positive')
        type = sb.ArcType.PositiveInfluence;
      else if (sign === 'negative')
        type = sb.ArcType.NegativeInfluence;
    }
    else
      type = sb.ArcType.UnknownInfluence;
    doc.createArc(id).type(type).source($(this).attr('from')).target($(this).attr('to'));  
  });
  
  
  var rules = {};
  $(nodes).each(function() {
    var i, rule;
    var arcs = doc.arcs(), incoming;
    id = $(this).attr('id');
    incoming = [];
    rule = 'false';
    for(i in arcs) {
      if(arcs[i].target().id() === id) {
        rule += '||' + arcs[i].source().id();
        incoming.push(arcs[i].id());
      }
    }
    rules[id] = '(' + Boolean(parseInt($(this).attr('basevalue'), 10)) +
     '&&!(' + rule + '))||((' + rule + ')&&(false';
    
    $(this).find('parameter').each(function() {
      var i, links;
      links = $(this).attr('idActiveInteractions').split(' ');
      incoming = incoming.filter(function(i) {return (links.indexOf(i) < 0);});
      
      rule = 'true';
      for (i in links)
        rule += '&&' + doc.arc(links[i]).source().id();
      for (i in incoming) 
        rule += '&&!' + doc.arc(incoming[i]).source().id();
        
      rules[id] += '||(' + rule + ')';
    });
    rules[id] += '))';
  });
  
  var jsbgn = JSON.parse(sb.io.write(doc, 'jsbgn'));
  this.nodes = jsbgn.nodes;
  this.edges = jsbgn.edges;
  this.rules = rules;
};

jSBGN.prototype.importBooleanNetwork = function (file, splitKey) {
  
  var targetNode, sourceNode;
  var targetID, sourceID, edgeID;
  var rules = {}, ruleNodes, rule;
  
  var doc = new sb.Document();
  doc.lang(sb.Language.AF);
  
  var lines, cols, i, j, trimmed;
  lines = file.split('\n');	//The file consists of a set of lines describing each node
	for (i = 0; i < lines.length; i++) {
    trimmed = lines[i].trim();
    if (trimmed.length === 0)
      continue;
    if (trimmed[0] != '#') {
      
      cols = trimmed.split(splitKey);
      if (cols.length != 2)
        console.error('Error in input file, line ' + i + ': Broken update rule');
      targetID = cols[0].trim();
      rule = cols[1].replace(/[&]/g, '&&').replace(/[|]/g, '||')
                    .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
                    .trim();
      
      if(targetID === 'targets' && splitKey === ',')
        continue;
      
      if (targetID[targetID.length-1] == '*')
        targetID = targetID.substring(0, targetID.length-1);
      
      if (!(targetID in rules))
        targetNode = doc.createNode(targetID).type(sb.NodeType.Macromolecule).label(targetID);  
      rules[targetID] = rule;
      
      if (rule === 'True' || rule === 'False') {
        rules[targetID] = rule.toLowerCase();
        continue;
      }
      ruleNodes = rules[targetID].match(/[A-Za-z0-9_]+/g);
      
      for (j in ruleNodes) {
        sourceID = ruleNodes[j];
        if (!(sourceID in rules)) {
          rules[sourceID] = sourceID;
          sourceNode = doc.createNode(sourceID).type(sb.NodeType.Macromolecule).label(sourceID);
        }
        edgeID = sourceID + ' -> ' + targetID;
        if (!(edgeID in rules)) {
          rules[edgeID] = '';
          doc.createArc(edgeID).type(sb.ArcType.LogicArc).source(sourceID).target(targetID);
        }
      }
		}
  }
  
  var jsbgn = JSON.parse(sb.io.write(doc, 'jsbgn'));
  this.nodes = jsbgn.nodes;
  this.edges = jsbgn.edges;
  this.rules = rules;
};


