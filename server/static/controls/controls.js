var Controls = ( function()	{
			return	{
				importSBML: function()	{
						if ( typeof(importSBMLwindow) != 'undefined' )
							importSBMLwindow.close();
						importSBMLwindow = Template.popup('Import SBML', 'width=450px,height=140px,screenX='+(window.width/2-200), templates+'/importSBML.html', {'images': images});
						}
				};
			} ) ();



