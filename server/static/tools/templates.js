Template = {
		URL : undefined,
		plain : undefined,
		rendered : undefined,

		get : function(URL) {
			if (URL.indexOf('http') != 0)
				URL = env["templates"]+URL;
			this.URL = URL;
			this.plain = GET(URL); // requires libhttp.js
			return this;
			},

		render : function(dict) {
				if (!dict)
					dict = env;
				this.rendered = this.plain;
				for (key in dict)
					this.rendered = this.rendered.replace_all('{{'+key+'}}', dict[key]); // requires string.js
				return this.rendered;
				},
	   };

TemplatePopup = {
		template : undefined,
		popup : undefined,

		open : function(URL, title, width, height, dict) {

				this.template = Template;
				this.template.get(URL);

				if (!dict)
					dict = env;

				this.popup = Popup;
				this.popup.open(title, width, height);
				this.popup.write(this.template.render(dict));

				return this;
				},

		close : function() {
				if (this.popup) {
					this.popup.close();
					delete this.template;
					delete this.popup;
					delete this;
					}
				}
	    };

