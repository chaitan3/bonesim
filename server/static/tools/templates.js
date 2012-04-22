Window = {
		iframe = null,

		open = function() {
				document.createElement('div');

		// create iframe

				newdiv.setAttribute('id', id);
				if (width) { newdiv.style.width = 300; }
				if (height) { newdiv.style.height = 300; }
				if ((left || top) || (left && top))
				{ newdiv.style.position = "absolute";
				if (left) { newdiv.style.left = left; }
				if (top) { newdiv.style.top = top; } }
				newdiv.style.background = "#00C";
				newdiv.style.border = "4px solid #000";
				if (html) { newdiv.innerHTML = html; } else { newdiv.innerHTML = "nothing"; }

	//populate iframe
            var ifrm = document.getElementById('myIframe');
            ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
            ifrm.document.open();
            ifrm.document.write('Hello World!');
            ifrm.document.close();

				document.body.appendChild(newdiv);
				return iframe;
				},
		close = function() {
				// destroy
				document.body.removeChild(this.iframe);
				}
	 };

Template = {
		getTemplate = function(URL) {
				if (URL.indexOf('http') != 0)
					URL = env["templates"]+URL;
				this.URL = URL;
				this.templateHTML = GET(URL); // requires libhttp.js
				return this.templateHTML;
				},

		renderTemplate = function(dict) {
					this.innerHTML = this.templateHTML;
					for (key in dict)
						this.innerHTML = this.innerHTML.replace_all('{{'+key+'}}', dict[key]); // requires string.js
					return this.innerHTML;
					},

		popup = function(URL, title, width, height, dict) {

				this.getTemplate(URL);

				if (!dict)
					dict = env;
				this.renderTemplate(dict);

				win = Window.open(title, width, height);
				doc = win.document;
				doc.write(page);
				doc.close();

				return win;
				}
	    };
