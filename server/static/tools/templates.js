Window = {
		div : null,
		iframe : null,

		open : function(title, width, height) {
				this.width = width;
				this.height = height;

				this.div = document.createElement('div');
				this.center();
				this.putDecorations();

				this.iframe = document.createElement('iframe');
				this.maximizeIFrame();

				document.body.appendChild(this.div);
				this.div.appendChild(this.iframe);

				return this;
				},

		center : function() {
				style = this.div.style;

				windowWidth = 1024;
				windowHeight = 768;
				left = (windowWidth-this.width)/2;
				top = (windowHeight-this.height)/2;

				style = this.div.style;
				style.position = "absolute";
				style.left = left;
				style.top = top;
				style.width = this.width;
				style.height = this.height;
				},

		putDecorations : function() {
					style = this.div.style;
					style.border = '1px solid black';
					style['background-color'] = 'white';
					style.opacity = 1;
					},

		maximizeIFrame : function() {
					style = this.iframe.style;
					style.border = '0px solid white';
					style.position = 'absolute';
					style.left = 0;
					style.top = 0;
					style.width = this.width;
					style.height = this.height;
					},

		write : function(HTML) {
				ifrm = this.iframe;
				ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
				doc = ifrm.document;
				doc.write(HTML);
				doc.close();
				},

		close : function() {
				document.removeChild(this.iframe);
				document.removeChild(this.div);
				delete this;
				}
	 };

Template = {
		window : null,

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

				this.window = Window;
				this.window.open(title, width, height);
				this.window.write(this.innerHTML);

				return this.window;
				}
	    };

