var jSBGN;

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
