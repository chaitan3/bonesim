var Template = ( function()	{
			return	{
				popup: function(title, attr, URL, dict) {
						page = GET(URL);
						for (key in dict)
							page = page.replace_all('{{'+key+'}}', dict[key]);	// requires string.js
						win = window.open('', title, 'location=no,directories=no,status=no,menubar=no,copyhistory=no,scrollbars=no,'+attr);
						doc = win.document;
						doc.write(page);
						doc.close();
						win.focus();
						if ( typeof(win) in ['null', 'undefined', 'none'] )
							alert('Popups disabled. Please enable popups for this app!');
						return win;
						}
				};
			} ) ();

