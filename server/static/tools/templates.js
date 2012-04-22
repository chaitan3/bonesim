Window = {
		background : undefined,
		div : undefined,

		open : function(title, width, height) {
				this.width = width;
				this.height = height;

				this.background = document.createElement('div');
				this.maximizeBackground();
				document.body.appendChild(this.background);

				this.div = document.createElement('div');
				this.centerDiv();
				this.putDivDecorations();

				document.body.appendChild(this.div);
				this.div.appendChild(this.iframe);

				return this;
				},

		maximizeBackground : function() {
					style = this.background.style;
					style.border = 0;
					style.position = 'absolute';
					style.left = 0;
					style.top = 0;
					style.width = "100%";
					style.height = "100%";
					style['background-color'] = 'grey';
					style.opacity = 0.7;
					},

		centerDiv : function() {
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

		putDivDecorations : function() {
					style = this.div.style;
					style.border = '1px dotted black';
					style.color = '#9ec9e2';
					style['background-color'] = 'black';
					style.opacity = 1;
					style.padding = '10px';
					},

		write : function(HTML) {
				this.div.innerHTML = HTML;
				},

		close : function() {
				if (this.background)
					document.removeChild(this.background);
				if (this.div) {
					this.div.innerHTML = '';
					document.removeChild(this.div);
					}
				if (this)
					delete this;
				}
	 };

Template = {
		window : undefined,

		popup : function(URL, title, width, height, dict) {

				this.getTemplate(URL);

				if (!dict)
					dict = env;
				this.renderTemplate(dict);

				this.window = Window;
				this.window.open(title, width, height);
				this.window.write(this.innerHTML);

				return this;
				},

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

		close : function() {
				if (this.window) {
					this.window.close();
					delete this;
					}
				}
	    };

