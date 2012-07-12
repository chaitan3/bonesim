function ruleJS(data) {
  return data.replace(/[&]/g, '&&').replace(/[|]/g, '||')
  .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
  .trim();
}

var protein_name_regex = /[A-Za-z0-9_]+/g;
var jSBGN;

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
      rule = ruleJS(cols[1].trim());
      
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
      ruleNodes = rules[targetID].match(protein_name_regex);
      
      for (j in ruleNodes) {
        sourceID = ruleNodes[j];
        if (!(sourceID in rules)) {
          rules[sourceID] = '';
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

