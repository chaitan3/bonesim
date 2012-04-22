Popup = {
		background : undefined,
		div : undefined,

		open : function(title, width, height) {
				this.width = width;
				this.height = height;

				this.background = document.createElement('div');
//				this.maximizeBackground();
					style = this.background.style;
					style.border = 0;
					style.position = 'absolute';
					style.left = 0;
					style.top = 0;
					style.width = "100%";
					style.height = "100%";
					style['background-color'] = 'grey';
					style.opacity = 0.7;
				document.body.appendChild(this.background);

				this.div = document.createElement('div');
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
					style.opacity = 1;
					style.padding = '10px';

				document.body.appendChild(this.div);

				this.write = Popup.write;
				this.close = Popup.close;
				},

		write : function(HTML) {
				DOMinsert(HTML, this.div); // requires templates.js
				},

		close : function() {
				if (this.background)
					document.body.removeChild(this.background);
				if (this.div) {
					this.div.innerHTML = '';
					document.body.removeChild(this.div);
					}
				if (this)
					delete this;
				}
	 };

