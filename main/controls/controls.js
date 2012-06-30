function readFile() {
  var file = ($('#File')[0].files)[0];
  var reader = new FileReader();
  reader.onloadend = function(read) {
    importFile(read.target.result);
  }
  reader.readAsText(file);
  $('#importDialog').dialog('close');
}

function importFile(data) {
  var network = new jSBGN();
  network.importRBoolNet(data);
  
  importHandle = graph.suspendRedraw(20000);
  
	bui.importFromJSON(graph, network);
  network.layout();
  
  graph.unsuspendRedraw(importHandle);
  
  simulator = new Simulator(network, 500);
  $('#simulation').click(simulator.start);
}
