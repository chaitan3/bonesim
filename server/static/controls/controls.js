var Controls = ( function()	{
			return	{
				importJSON: function()	{
						if ( typeof(importJSONwindow) != 'undefined' )
							importJSONwindow.close();
						importJSONwindow = Template.popup('Import JSON', 'width=450px,height=150px', templates+'/importJSON.html', {'biographer':biographer, 'images':images, 'tools':tools});
						},
				importSBML: function()	{
						if ( typeof(importSBMLwindow) != 'undefined' )
							importSBMLwindow.close();
						importSBMLwindow = Template.popup('Import SBML', 'width=450px,height=165px', templates+'/importSBML.html', {'biographer':biographer, 'images':images, 'tools':tools});
						},
				exportJSON: function() {
						window.open('data:text/html,network = '+network+';', 'Export JSON', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
						},
				viewSVGsource: function() {
						window.open('data:text/html,&lt;svg&gt;&lt;/svg&gt;', 'View SVG', 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no');
						},
				Layout: function()	{
						if ( typeof(LayoutWindow) != 'undefined' )
							LayoutWindow.close();
						LayoutWindow = Template.popup('Layout', 'width=250px,height=140px', templates+'/Layout.html', {'biographer':biographer, 'images':images, 'tools':tools});
						},
				loadBooleanNetwork: function()	{
						if ( typeof(loadBooleanNetworkwindow) != 'undefined' )
							loadBooleanNetworkwindow.close();
						loadBooleanNetworkwindow = Template.popup('Import Boolean Network', 'width=450px,height=150px', templates+'/loadBooleanNetwork.html', {'biographer':biographer, 'images':images, 'tools':tools});
						},
				};
			} ) ();

