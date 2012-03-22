function get(URL) {
	var r = new XMLHttpRequest()
	r.open("GET", URL, false);
	r.send(null);
	return r.responseText;
	}

var Template = ( function()	{
			return	{
				popup: function(title, attr, URL, dict) {
						page = get(URL);
						for (key in dict) {
							page = page.replace('{{'+key+'}}', dict[key]);
							}
						win = window.open('', title, 'location=no,directories=no,status=yes,menubar=no,copyhistory=no,scrollbars=no,'+attr);
						doc = win.document;
						doc.write(page);
						doc.close();
						return win;
						}
				};
			} ) ();

