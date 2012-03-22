var Template = ( function()	{
			return	{
				popup: function(title, attr, URL, dict) {
						page = GET(URL);
						for (key in dict) {
							page = replace_all(page, '{{'+key+'}}', dict[key]);
							}
						win = window.open('', title, 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no,'+attr);
						doc = win.document;
						doc.write(page);
						doc.close();
						return win;
						}
				};
			} ) ();

