
document.onkeyup = function(e) {
			if (e.keyCode == 27) {
				window.close();	// Esc
				}
			};

function ImportFactory() {
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

function Parse() {
	try 	{	// json = JSON.parse(translated);
			eval('json = '+translated+';');	// very dangerous for man-in-the middle code injection !!!
							// but seems to be faster
		}
	catch(err) {	debug('Fatal: JSON parsing failed.');
			alert('Server did not send a valid JSON response!');
			return
		}
	debug('Translation successfully imported: '+json['nodes'].length+' nodes, '+json['edges'].length+' edges');
	UI_window.network = json;
	if ( document.getElementById('layout').checked )
		window.setTimeout('doLayout();', 100);
	else if ( document.getElementById('update').checked )
		window.setTimeout('updateUI();', 100);
	else
		window.close();
	}

function doLayout() {
	// ...
	if ( document.getElementById('update').checked )
		window.setTimeout('updateUI();', 100);
	else
		window.close();
	}

function updateUI() {
	UI_window.bui.importFromJSON(UI_window.graph, UI_window.network);
	debug('UI updated. '+UI_window.network['nodes'].length+' nodes, '+UI_window.network['edges'].length+' edges.');
	window.close();
	}

