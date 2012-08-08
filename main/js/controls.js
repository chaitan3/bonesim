var fileObject;
var network = null, trans = null;
var simulator = null;
var jSBGN, Simulator;

$(document).ready(function() {
  // Load the jQuery UI tabs
  $('#tabs').tabs();
  $('#tabs').tabs('select', '#grn');
  $('#tabs').bind('tabsselect', tabChange);
  
  // Initialise all the jQuery UI components
  $('#zoom').slider({ step: 0.1, max: 2, stop: zoomGraph});
  $('#simulation').button({icons: {primary: "ui-icon-play" }});
  $('#analyze').button({icons: {primary: "ui-icon-gear" }});
  $('#importButton').button({icons: {primary: "ui-icon-folder-open" }});
  $('#exportButton').button({icons: {primary: "ui-icon-disk" }});
  $('#importDialog').dialog({ autoOpen: false, minWidth: 600, modal: true });
  $('#exportDialog').dialog({ autoOpen: false, minWidth: 400, modal: true });
  $('#editDialog').dialog({ autoOpen: false, minWidth: 400, modal: true });
  $('#progress').hide();
  
  addListeners();
  
  getScripts();
  
});

/** Bind functions to the respective listeners.
 */
function addListeners() {
  $('#importButton').click(importDialog);
  $('#file')[0].addEventListener('change', readFile, false);
  $('#dropFile')[0].addEventListener('drop', dropFile, false);
  $('#dropFile')[0].addEventListener('dragenter', dragEnter, false);
  $('#dropFile')[0].addEventListener('dragleave', dragExit, false);
  $('#dropFile')[0].addEventListener('dragover', dnd, false);
  $('#importFile').click(importFile);
  
  $('#exportButton').click(exportDialog);
  $('#exportFile').click(exportFile);
}

/** Fetch all the scripts not essential to UI asynchronously.
 */
function getScripts() {
  // Ensure that the files are fetched as JS.
  $.ajaxSetup({
    cache: true,
    beforeSend: function(xhr) {
      xhr.overrideMimeType("text/javascript");
    }
  });
  
  $.getScript("lib/jquery.simulate.js");
	$.getScript("lib/biographer-ui.min.js", function() {
    bui.settings.css.stylesheetUrl = 'css/visualization-svg.css';
  });
  $.getScript("lib/interact.js");
  $.getScript("lib/d3.v2.min.js");
  $.getScript("lib/libSBGN.min.js");
  $.getScript("lib/rickshaw.min.js");

	$.getScript("js/import.js");
  $.getScript("js/simulator.js");
  
  $.ajaxSetup({
    beforeSend: null
  });
}

/** 
 * The event handler for a change in the value of the Graph Zool slider.
 * @param {Event} event The event object containing information about the 
 * type of event.
 * @param {UI} ui Contains the value of the slider.
 */
function zoomGraph(event, ui) {
  // Get the index of the selected tab.
  var i = $('#tabs').tabs('option', 'selected');
  
  // Get the correct bui.Graph instance depending on the current tab.
  if(i === 0) {
    if (network === null)
      return;
    graph = network;
  }
  else if(i === 1) {
    if (trans === null)
      return;
    graph = trans;
  }
  
  // Scale the bui graph to the value set by the slider
  graph.scale(ui.value);
  graph.reduceTopLeftWhitespace();
}

/** 
 * The event handler for a tab change.
 * @param {Event} event The event object containing information about the 
 * type of event.
 * @param {UI} ui Contains the index of the selected tab.
 */
function tabChange(event, ui) {
  // Get the current tab index
  var i = ui.index;
  
  if(i === 0) {
    if (network === null)
      return;
    graph = network;
  }
  else if(i === 1) {
    if (trans === null)
      return;
    graph = trans;
  }
  else
    return;
  
  // Set the slider's value to the current graph's scale 
  $('#zoom').slider('option', 'value', graph.scale());
}

/** 
 * The event handler for clicking the choose file box.
 * @param {Event} event The event object containing information about the 
 * type of event. Contains the file list.
 */
function readFile(event) {
  // Get the file object from the event
  fileObject = event.target.files[0];
}

/** 
 * Prevent the default events from triggering for the drag and drop box.
 * @param {Event} event The event object containing information about the 
 * type of event. 
 */
function dnd(event) {
  event.stopPropagation();
  event.preventDefault();
}

/** 
 * The event handler for dropping a file in the box.
 * @param {Event} event The event object containing information about the 
 * type of event. Contains the file list.
 */
function dropFile(event) {
  dnd(event);
  // Get the file object and set the file name
  fileObject = event.dataTransfer.files[0];
  $('#dropFile span').html(fileObject.name);
}

/** 
 * The event handler for entering a file into the box space.
 * @param {Event} event The event object containing information about the 
 * type of event. 
 */
function dragEnter(event) {
  dnd(event);
  // Change the box to reflect the new state.
  $('#dropFile span').html('Drop File now');
}

/** 
 * The event handler for exiting the box space.
 * @param {Event} event The event object containing information about the 
 * type of event. 
 */
function dragExit(event) {
  dnd(event);
  $('#dropFile span').html('Drag and Drop File');
}

/** 
 * The event handler for opening the import dialog box.
 */
function importDialog() {
  // If the simulator is running stop it.
  if(simulator !== null) 
    simulator.stop();
    
  // Set all values to their initial states.
  fileObject = null;
  $('#file').attr({ value: '' });
  $('#dropFile span').html('Drag and Drop File');
  $('#importDialog').dialog('open');
}

/** 
 * The eevnt handler for the import file button in the import file dialog
 * box.
 */  
function importFile() {
  $('#importDialog').dialog('close');
  
  if (fileObject === null)
    return;
  
  // Create an instance of the file reader and jSBGN.
  var reader = new FileReader();
  var data, jsbgn = new jSBGN(), file = fileObject;
  
  // This event handler is called when the file reading task is complete
  reader.onload = function(read) {
    // Get the data contained in the file
    data = read.target.result;
    
    // Depending on the file type option checked in the import dialog box
    // call the appropriate importer
    if($('#r').attr('checked'))
      jsbgn.importBooleanNetwork(data, ',');
    else if($('#python').attr('checked'))
      jsbgn.importBooleanNetwork(data, '=');
    else if($('#ginml').attr('checked'))
      jsbgn.importGINML(data);
    else 
      jsbgn.importSBML(file, data);
      
    $('#stg').html('');
    
    // Import the jSBGN object into a bui.Graph instance
    network = importNetwork(jsbgn, '#grn');
    $('#tabs').tabs('select', '#grn');
    $('#iteration').text(0);
    
    // Delete any previous instance of the Simulator and initialise a new one
    if(simulator !== null) 
      simulator.destroy();
    simulator = new Simulator();
    if($('#sbml').attr('checked'))
      simulator.scopes = true;  
    simulator.init(jsbgn, 500, $('#guessSeed').attr('checked'));
  };
  reader.readAsText(file);
}

/** 
 * Import a jSBGN object into the Network tab by creating a new bui.Graph
 * instance.
 * @param {jSBGN} jsbgn The network in the form of a jSBGN object.
 * @param {string} tab The tab in which to display the graph.
 */
function importNetwork(jsbgn, tab) {
  $(tab).html('');
  var graph = new bui.Graph($(tab)[0]);
  
  var importHandle = graph.suspendRedraw(20000);
	bui.importFromJSON(graph, jsbgn);
  // Do the layouting
  jsbgn.connect();
  jsbgn.layout(graph);
  jsbgn.redraw(graph);
  // Center the graph and optionally scale it
  graph.reduceTopLeftWhitespace();
  if($('#scale').attr('checked')) 
    graph.fitToPage();
  graph.unsuspendRedraw(importHandle);
  $('#zoom').slider('option', 'value', graph.scale());
  $('#tabs').tabs('select', tab);
  
  return graph;
}

/** 
 * Return the seed to be given initially to the network.
 */
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

/** 
 * The event handler for opening the export dialog.
 */
function exportDialog() {
  if(simulator !== null) 
    simulator.stop();
  $('#exportDialog').dialog('open');
}

/** 
 * The event handler for clicking the export file button of the export
 * file dialog box.
 */
function exportFile() {
  $('#exportDialog').dialog('close');
  
  // Get the bui.Graph instance of the select graph to export
  var graph;
  if ($('#networke').attr('checked'))
    graph = network;
  else if ($('#transe').attr('checked'))
    graph = trans;
  else {
    // Export the update rules to a Boolean Net format file.
    if(!$('#sbml').attr('checked')) {
      if ($('#rbn').attr('checked'))
        var bn = simulator.exportRBoolNet();
      else
        var bn = simulator.exportPythonBooleanNet();
      var content = "data:text/plain," + encodeURIComponent(bn);
      window.open(content, 'tmp');
    }
    return;
  }
  
  // Check the file format to which the graph has to be exported
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
