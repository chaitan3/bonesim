function readFile() {
  var file = ($('#file')[0].files)[0];
  var reader = new FileReader();
  reader.onloadend = function(read) {
    importFile(read.target.result, file);
  }
  reader.readAsText(file);
  $('#importDialog').dialog('close');
}

function importFile(data, file) {
  var network = new jSBGN();
  
  if($('#r').attr('checked'))
    network.importBooleanNetwork(data, ',');
  else if($('#python').attr('checked'))
    network.importBooleanNetwork(data, '=');
  else {
    if($('#guessSeed').attr('checked'))
      network.importSBML(file, true);
    else
      network.importSBML(file, false);
  }
}

function importNetwork(network) {
  $('#bui_tab').html('');
  graph = new bui.Graph($('#bui_tab')[0]);
  
  var importHandle = graph.suspendRedraw(20000);
	bui.importFromJSON(graph, network);
  network.layout();
  graph.unsuspendRedraw(importHandle);
  
  simulator = new Simulator();
  simulator.init(network, 500);
}

function getInitialSeed() {
  if($('#allTrue').attr('checked')) 
    return true;
  else if ($('#allFalse').attr('checked')) 
    return false;
  else if ($('#randomSeed').attr('checked')) 
    return Boolean(Math.round(Math.random()));
  else
    return true;
}
