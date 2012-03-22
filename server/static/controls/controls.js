var Controls = ( function()	{
			return	{
				importSBML: function()	{
						if ( typeof(importSBMLwindow) != 'undefined' )
							importSBMLwindow.close();
						importSBMLwindow = Template.popup('Import SBML', 'width=450px,height=150px', templates+'/importSBML.html', {'biographer':biographer, 'images':images, 'tools':tools});
						}
				};
			} ) ();



