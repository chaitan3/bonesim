var Controls = ( function()	{
			return	{
				importJSON:	function() {
							if ( typeof(importJSONwindow) != 'undefined' )
								importJSONwindow.close();
							importJSONwindow = Template.popup('Import JSON', 'width=450px,height=180px', env["templates"]+'/importJSON.html', env);
							},

				importSBML:	function() {
							if ( typeof(importSBMLwindow) != 'undefined' )
								importSBMLwindow.close();
							importSBMLwindow = Template.popup('Import SBML', 'width=450px,height=180px', env["templates"]+'/importSBML.html', env);
							},

				reloadUI:  	function() {
							if ( typeof(reloadUIwindow) != 'undefined' )
								reloadUIwindow.close();
							reloadUIwindow = Template.popup('Reloading UI ...', 'width=80px,height=120px', env["templates"]+'/wait.html', env);
							delete graph;
							graph = new bui.Graph( document.getElementById('canvas') );
							bui.importFromJSON(graph, network);
							reloadUIwindow.close();
							},

				exportJSON:	function() {
							window.open('data:text/html,network = '+JSON.stringify(network)+';', 'Export JSON', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
							},

				viewSVGsource:	function() {
							window.open('data:text/html,&lt;svg&gt;&lt;/svg&gt;', 'View SVG', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
							},

				Layout:		function() {
							if ( typeof(LayoutWindow) != 'undefined' )
								LayoutWindow.close();
							LayoutWindow = Template.popup('Layout', 'width=260px,height=150px', env["templates"]+'/Layout.html', env);
							},

				loadBooleanNetwork: function() {
							if ( typeof(loadBooleanNetworkwindow) != 'undefined' )
								loadBooleanNetworkwindow.close();
							loadBooleanNetworkwindow = Template.popup('Import Boolean Network', 'width=450px,height=150px', env["templates"]+'/loadBooleanNetwork.html', env);
							},
				};
			} ) ();

