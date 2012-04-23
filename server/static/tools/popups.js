
Popup = {
		background : undefined,
		div : undefined,

		open : function(title, width, height) {
				this.width = width;
				this.height = height;

				this.background = document.createElement('div');
				document.body.appendChild(this.background);
//				this.maximizeBackground();
					style = this.background.style;
					style.border = 0;
					style.position = 'absolute';
					style.left = 0;
					style.top = 0;
					style.width = "100%";
					style.height = "100%";
					style['background-color'] = 'grey';
					style.opacity = 0;
				this.background.id = Math.random();
				new OpacityFader(this.background, start=0, stop=0.7, duration=300, delayStart=0);

				this.div = document.createElement('div');
				document.body.appendChild(this.div);
//				this.centerDiv();
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
//				this.putDivDecorations();
					style = this.div.style;
					style.border = '1px dotted black';
					style.color = '#9ec9e2';
					style['background-color'] = 'black';
					style.opacity = 0;
					style.padding = '10px';

				this.div.id = Math.random();
				new OpacityFader(this.div, start=0, stop=1, duration=375, delayStart=300);

				this.write = Popup.write;
				this.close = Popup.close;
				},

		write : function(HTML) {
				DOMinsert(HTML, this.div); // requires templates.js
				},

		close : function() {
				if (this.div) {
					new OpacityFader(this.div, start=0.7, stop=0, duration=300, delayStart=0);
					window.setTimeout('document.body.removeChild(document.getElementById("'+this.div.id+'"));', 300);
					}
				if (this.background) {
					new OpacityFader(this.background, start=0.7, stop=0, duration=300, delayStart=300);
					window.setTimeout('document.body.removeChild(document.getElementById("'+this.background.id+'"));', 600);
					}
				if (this) {
					delete this;
					}
				}
	 };

