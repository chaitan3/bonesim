Window = {
		div : null,
		iframe : null,

		open : function(title, width, height) {
				this.div = document.createElement('div');

				this.width = width;
				this.height = height;
				this.center();
				this.putDecorations();

				this.div.innerHTML = "Hello world!";

				document.body.appendChild(this.div);
				return this.div;
				},

		center : function() {
				style = this.div.style;

				windowWidth = 1024;
				windowHeight = 768;
				left = (windowWidth-this.width)/2;
				top = (windowHeight-this.height)/2;

				this.div.style.position = "absolute";
				this.div.style.left = left;
				this.div.style.top = top;
				this.div.style.width = this.width;
				this.div.style.height = this.height;
				},

		putDecorations : function() {
					style = this.div.style;
					style.border = '1px solid black';
					style['background-color'] = 'white';
					style.opacity = 1;
					},

		write : function(HTML) {
				ifrm = this.iframe;
				ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
				doc = ifrm.document;
				doc.write(page);
				doc.close();
				},

		close : function() {
				// destroy
				document.body.removeChild(this.iframe);
				}
	 };

Template = {
		getTemplate : function(URL) {
				if (URL.indexOf('http') != 0)
					URL = env["templates"]+URL;
				this.URL = URL;
				this.templateHTML = GET(URL); // requires libhttp.js
				return this.templateHTML;
				},

		renderTemplate : function(dict) {
					this.innerHTML = this.templateHTML;
					for (key in dict)
						this.innerHTML = this.innerHTML.replace_all('{{'+key+'}}', dict[key]); // requires string.js
					return this.innerHTML;
					},

		popup : function(URL, title, width, height, dict) {

				this.getTemplate(URL);

				if (!dict)
					dict = env;
				this.renderTemplate(dict);

				win = Window.open(title, width, height);
				win.write(this.innerHTML);

				return win;
				}
	    };
