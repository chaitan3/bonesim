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
    network.importRBoolNet(data);
  else if($('#python').attr('checked'))
    network.importBooleNet(data);
  else {
    network.importSBML(file);
    if($('#guessSeed').attr('checked'))
      network.applyGuessSeed();
  }
    
  //Apply Seed
  
  
  var importHandle = graph.suspendRedraw(20000);
  
	bui.importFromJSON(graph, network);
  network.layout();
  
  graph.unsuspendRedraw(importHandle);
  
  simulator = new Simulator(network, 500);
  $('#simulation').click(simulator.start);
  
  if($('#sbml').attr('checked'))
    simulator.scopes = true;
}
