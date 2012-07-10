jSBGN.prototype.importGINML = function(file) {
  //todo 
  //add visual setting importers, taken care by layout currently
  //boolean only supported that is maxval = 1
  
  var xml = $.parseXML(file);
  var nodes = $(xml).find('node');
  var edges = $(xml).find('edge');
  var id, sign, type;
  var incoming, arcs, links, rule;
  var jsbgn, rules = new Object();
  var doc = new sb.Document();
  var i;
  
  doc.lang(sb.Language.AF);
  
  $(nodes).each(function() {
    id = $(this).attr('id');
    doc.createNode(id).type(sb.NodeType.Macromolecule).label(id);
  });
  
  $(edges).each(function() {
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
  
  arcs = doc.arcs();
  
  $(nodes).each(function() {
    id = $(this).attr('id');
    incoming = [];
    rule = 'false';
    for(i in arcs) {
      if(arcs[i].target().id() === id) {
        rule += '||' + arcs[i].source().id();
        incoming.push(arcs[i].id());
      }
    }
    rules[id] = '(' + Boolean(parseInt($(this).attr('basevalue'))) + '&&!(' + rule + '))||((' + rule + ')&&(false';
    
    $(this).find('parameter').each(function() {
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
  
  jsbgn = JSON.parse(sb.io.write(doc, 'jsbgn'));
  this.nodes = jsbgn.nodes;
  this.edges = jsbgn.edges;
  this.rules = rules;
}
