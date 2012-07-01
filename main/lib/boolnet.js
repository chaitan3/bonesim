ruleJS = function(data) {
  return data.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
  .replace_all(' & ', ' && ').replace_all(' | ', ' || ').trim();
}

protein_name_regex = /[A-Za-z0-9_]+/g;
      
jSBGN.prototype.importBooleanNetwork = function(file, splitKey) {
  var lines, cols, i;
  var targetNode, sourceNode;
  var targetID, sourceID, edgeID;
  var rules = new Object(), ruleNodes, rule;
  var doc = new sb.Document();
  var jsbgn, skip, trimmed;
  
  lines = file.split('\n');	//The file consists of a set of lines describing each node
	for (i = 0; i < lines.length; i++) {
    trimmed = lines[i].trim();
    if (trimmed.length == 0) 
      continue;
    if (trimmed[0] != '#') {
      
      cols = trimmed.split(splitKey);
      if (cols.length != 2)
        console.error('Error in input file, line ' + i + ': Broken update rule')
      targetID = cols[0].trim();
      rule = ruleJS(cols[1].trim());
      
      if(targetID == 'targets' && splitKey == ',')
        continue;
      
      if (targetID[targetID.length-1] == '*')
        targetID = targetID.substring(0, targetID.length-1);
      
      if (!(targetID in rules))
        targetNode = doc.createNode(targetID).type(sb.NodeType.SimpleChemical).label(targetID);  
      rules[targetID] = rule;
      
      if (rule == 'True' || rule == 'False') 
        continue;
        
      ruleNodes = rules[targetID].match(protein_name_regex);
      
      for (j in ruleNodes) {
        sourceID = ruleNodes[j];
        if (!(sourceID in rules)) {
          rules[sourceID] = '';
          sourceNode = doc.createNode(sourceID).type(sb.NodeType.SimpleChemical).label(sourceID);
        }
        edgeID = sourceID + ' -> ' + targetID;
        if (!(edgeID in rules)) {
          rules[edgeID] = '';
          doc.createArc(edgeID).source(sourceID).target(targetID);
        }
      }
		}
  }
  jsbgn = JSON.parse(sb.io.write(doc, 'jsbgn'));
  this.nodes = jsbgn.nodes;
  this.edges = jsbgn.edges;
  this.rules = rules;
  console.log('Imported '+this.nodes.length+' nodes and '+this.edges.length+' edges.');
}

