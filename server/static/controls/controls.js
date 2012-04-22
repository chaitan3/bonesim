importBooleNet = function() {
			if ( typeof(importBooleNetWindow) != 'undefined' )
				importBooleNetWindow.close();
			importBooleNetWindow = new TemplatePopup.open('/importBooleNet.html', 'Import Boolean Network', 650, 230);
			};

updateUI = function() {
		if ( typeof(updateUIwindow) != 'undefined' )
			updateUIwindow.close();
		updateUIwindow = Template.popup('Updating UI ...', 'width=80px,height=120px', env["templates"]+'/wait.html', env);
		updateUI();
		updateUIwindow.close();
		};

showJSON = function() {
		window.open('data:text/html,network = '+JSON.stringify(network)+';', 'Export JSON', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
		};

showSVG = function() {
		window.open('data:text/html,&lt;svg&gt;&lt;/svg&gt;', 'View SVG', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
		};

