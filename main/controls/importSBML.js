
BooleNetDebug = function(msg) {
			e = document.getElementById('BooleNetDebug');
			if (e)
				e.innerHTML = msg;
			}

function LoadSBML() {
	delete network;
	scopes = true;
  var data;
  
	BooleNetDebug('Downloading ...');
  $.get(env['biographer']+'/Get/Sample_SBML', 
  function(response) {
    data = response;
  });
	BooleNetDebug('Importing ...');
	network = SBML_import(data);
	if (document.getElementById('guess').checked) {
    $.get(env['biographer']+'/Simulate/InitialSeed', 
    function(response) {
      data = response;
    });
		SBML_importGuessSeed(data);
		console.log('Guess seed chosen.');
	}
	BooleNetDebug('Graphviz ...');
	doGraphviz();
	if (typeof(importSBMLWindow) != 'undefined')
		importSBMLWindow.close();
	if (typeof(popupControls) != 'undefined')
		window.setTimeout('popupControls.close();', 300);
	}


