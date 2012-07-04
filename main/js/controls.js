var fileObject;

bui.ready(function() {
  bui.settings.css.stylesheetUrl = 'css/visualization-svg.css';
  
  $('#tabs').tabs();
  $('#simulation').button({icons: {primary: "ui-icon-play" }});
  $('#importButton').button({icons: {primary: "ui-icon-folder-open" }});
  $('#exportButton').button({icons: {primary: "ui-icon-disk" }});
  $('#importDialog').dialog({ autoOpen: false, minWidth: 600 });
  $('#progress').hide();
  
  $('#importButton').click(importDialog);
  $('#file')[0].addEventListener('change', readFile, false);
  $('#dropFile')[0].addEventListener('drop', dropFile, false);
  $('#dropFile')[0].addEventListener('dragenter', dragEnter, false);
  $('#dropFile')[0].addEventListener('dragleave', dragExit, false);
  $('#dropFile')[0].addEventListener('dragover', dnd, false);
  $('#importFile').click(importFile);
});

function readFile(event) {
  fileObject = event.target.files[0];
}

function dnd(event) {
  event.stopPropagation();
  event.preventDefault();
}

function dropFile(event) {
  dnd(event);
  fileObject = event.dataTransfer.files[0];
  $('#dropFile span').html(fileObject.name);
}

function dragEnter(event) {
  dnd(event);
  $('#dropFile span').html('Drop File now');
}

function dragExit(event) {
  dnd(event);
  $('#dropFile span').html('Drag and Drop File');
}

function importDialog() {
  if(typeof(simulator) != "undefined") 
    simulator.stop();
  fileObject = null;
  $('#file').attr({ value: '' });
  $('#dropFile span').html('Drag and Drop File');
  $('#importDialog').dialog('open');
}
  
function importFile() {
  $('#importDialog').dialog('close');
  
  if (fileObject == null)
    return;
  
  var reader = new FileReader();
  var data, network, file = fileObject;
  
  reader.onload = function(read) {
    data = read.target.result;
    network = new jSBGN();
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
  reader.readAsText(file);
}

function importNetwork(network) {
  $('#bui').html('');
  graph = new bui.Graph($('#bui')[0]);
  
  var importHandle = graph.suspendRedraw(20000);
	bui.importFromJSON(graph, network);
  network.layout();
  graph.unsuspendRedraw(importHandle);
  
  if(typeof(simulator) != "undefined") 
    simulator.destroy();
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
