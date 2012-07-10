var fileObject;

bui.ready(function() {
  bui.settings.css.stylesheetUrl = 'css/visualization-svg.css';
  
  $('#tabs').tabs();
  $('#tabs').tabs('select', '#grn');
  $('#simulation').button({icons: {primary: "ui-icon-play" }});
  $('#analyze').button({icons: {primary: "ui-icon-gear" }});
  $('#importButton').button({icons: {primary: "ui-icon-folder-open" }});
  $('#exportButton').button({icons: {primary: "ui-icon-disk" }});
  $('#importDialog').dialog({ autoOpen: false, minWidth: 600 });
  $('#exportDialog').dialog({ autoOpen: false, minWidth: 400 });
  $('#progress').hide();
  
  $('#importButton').click(importDialog);
  $('#file')[0].addEventListener('change', readFile, false);
  $('#dropFile')[0].addEventListener('drop', dropFile, false);
  $('#dropFile')[0].addEventListener('dragenter', dragEnter, false);
  $('#dropFile')[0].addEventListener('dragleave', dragExit, false);
  $('#dropFile')[0].addEventListener('dragover', dnd, false);
  $('#importFile').click(importFile);
  
  $('#exportButton').click(exportDialog);
  $('#exportFile').click(exportFile);
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
  var data, jsbgn, file = fileObject;
  
  reader.onload = function(read) {
    data = read.target.result;
    jsbgn = new jSBGN();
    if($('#r').attr('checked'))
      jsbgn.importBooleanNetwork(data, ',');
    else if($('#python').attr('checked'))
      jsbgn.importBooleanNetwork(data, '=');
    else if($('#ginml').attr('checked'))
      jsbgn.importGINML(data);
    else {
      if($('#guessSeed').attr('checked'))
        jsbgn.importSBML(file, true);
      else
        jsbgn.importSBML(file, false);
    }
    $('#stg').html('');
    network = importNetwork(jsbgn, '#grn');
    $('#tabs').tabs('select', '#grn');
    
    if(typeof(simulator) != "undefined") 
      simulator.destroy();
    simulator = new Simulator();
    simulator.init(jsbgn, 500);
  }
  reader.readAsText(file);
}

function importNetwork(jsbgn, tab) {
  $(tab).html('');
  var graph = new bui.Graph($(tab)[0]);
  
  var importHandle = graph.suspendRedraw(20000);
	bui.importFromJSON(graph, jsbgn);
  jsbgn.layout(graph);
  if($('#scale').attr('checked')) 
    graph.fitToPage();
  graph.unsuspendRedraw(importHandle);
  
  return graph;
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


function exportDialog() {
  if(typeof(simulator) != "undefined") 
    simulator.stop();
  $('#exportDialog').dialog('open');
}

function exportFile() {
  $('#exportDialog').dialog('close');
  
  var graph;
  if ($('#network').attr('checked'))
    graph = network;
  else if ($('#trans').attr('checked'))
    graph = trans;
    
  if ($('#sbgn').attr('checked')) {
    var jsbgn = graph.toJSON();
    var sbgn = null;
    alert('Wait for Lian to finish his jsbgn reader');
  }
  else if ($('#jsbgn').attr('checked')) {
    var jsbgn = JSON.stringify(graph.toJSON());
    var content = "data:text/plain," + encodeURIComponent(jsbgn);
    window.open(content, 'tmp');
  }
  else if ($('#svg').attr('checked')) {
    var svg = graph.rawSVG();
    var content = "data:image/svg+xml," + encodeURIComponent(svg);
    window.open(content, 'tmp');
  }
}
