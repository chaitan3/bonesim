
document.onkeyup = function(e) {
			if (e.keyCode == 27) {
				window.close();	// Esc
				}
			};

function ImportChain() {
	document.getElementById('ButtonCol').style.display = 'none';
	document.getElementById('ProgressCol').style.display = 'inline';
	rotateAroundCenter();
	debug('Opening file ...');
	var reader = new FileReader();
	reader.readAsText(document.getElementById('File').files[0]);
	reader.onload = Opened;
	}

function Opened(evt) {
	data = evt.target.result;
	debug('Opened. Asking the server to translate the file ...');
	window.setTimeout('Translate();', 100);
	}

function Translate() {
	ServerTimeout = window.setTimeout('ServerTimedOut();', 10);
	try	{
		translated = POST(Translator, 'data='+data).replace('\n','').replace('\t','');
		}
	catch(err) {
		debug(err);
		alert(err);
		return
		}
	finally {
		window.clearTimeout(ServerTimeout);
		debug('Translated. Parsing JSON ...');
		window.setTimeout('Parse();', 100);
		}
	}

function ServerTimedOut() {
	debug('Server timeout :-(');
	}

function parseJSON(string) {
	try 	{	// var response = JSON.parse(translated);
			eval('var obj = '+string+';');	// very dangerous for man-in-the middle code injection !!!
							// but seems to be faster
		}
	catch(err) {	debug('Fatal: JSON parsing failed.');
			alert('Server did not send a valid JSON response!');
			return ""
		}
	return obj;
	}

function Parse() {
	json = parseJSON(translated);
	s = 'Translation successfully imported: '+json['nodes'].length+' nodes, '+json['edges'].length+' edges';
	UI_window.network = json;
	if ( document.getElementById('layout').checked ) {
		debug(s+'<br/>Asking the server to make a nice layout ...');
		window.setTimeout('doLayout();', 100);
		}
	else if ( document.getElementById('update').checked ) {
		debug(s+'<br/>Updating UI ...');
		window.setTimeout('updateUI();', 100);
		}
	else
		window.close();
	}

function doLayout() {
	var network = { 'nodes': UI_window.network['nodes'], 'edges': UI_window.network['edges'] }; // no Boolean Network
	var json = JSON.stringify(network);
	POST(env['biographer']+'/Layout/biographer', 'JSON='+json, doneLayouting);
	}

function doneLayouting(response) {
	UI_window.network = parseJSON(response);
	if ( document.getElementById('update').checked ) {
		debug('Updating UI ...');
		window.setTimeout('updateUI();', 100);
		}
	else
		window.close();
	}

function updateUI() {
	delete UI_window.graph;
	UI_window.graph = new UI_window.bui.Graph( UI_window.document.body );
	UI_window.bui.importFromJSON(UI_window.graph, UI_window.network);
	debug('UI updated. '+UI_window.network['nodes'].length+' nodes, '+UI_window.network['edges'].length+' edges.');
	UI_window.focus();
	window.setTimeout('window.close();', 100);
	}

