
Popup = {
		background : undefined,
		div : undefined,

		open : function(title, width, height, fade) {
				this.width = width;
				this.height = height;
				this.fade = fade;

				// shadow div
				this.background = document.createElement('div');
				this.background.id = Math.random();
				this.background.style.border = 0;
				this.background.style.position = 'absolute';
				this.background.style.left = 0;
				this.background.style.top = 0;
				this.background.style.width = "100%";
				this.background.style.height = "100%";
				this.background.style['background-color'] = 'grey';
				this.background.style.opacity = 0.7;
				document.body.appendChild(this.background);

				if (fade) {
					this.background.style.opacity = 0;
					new OpacityFader(this.background, start=0, stop=0.7, duration=300, delayStart=0);
					}

				// popup window
				this.div = document.createElement('div');
				this.div.id = Math.random();
				this.div.style.border = '1px solid white';
				this.div.style.position = "absolute";
				this.div.style.width = this.width;
				this.div.style.height = this.height;
				this.div.style.left = (window.innerWidth-this.width)/2;
				this.div.style.top = (window.innerHeight-this.height)/2;
				this.div.style.color = '#9ec9e2';
				this.div.style['background-color'] = 'black';
				this.div.style.padding = '10px';
				document.body.appendChild(this.div);

				if (fade) {
					this.div.style.opacity = 0;
					new OpacityFader(this.div, start=0, stop=1, duration=375, delayStart=300);
					}

				this.write = Popup.write;
				this.close = Popup.close;
				},

		write : function(HTML) {
				DOMinsert(HTML, this.div); // requires templates.js
				},

		close : function() {
				if (this.div) {
					if (this.fade) {
						new OpacityFader(this.div, start=0.7, stop=0, duration=300, delayStart=0);
						window.setTimeout('document.body.removeChild(document.getElementById("'+this.div.id+'"));', 300);
						}
					else
						document.body.removeChild(this.div);
					}
				if (this.background) {
					if (this.fade) {
						new OpacityFader(this.background, start=0.7, stop=0, duration=300, delayStart=300);
						window.setTimeout('document.body.removeChild(document.getElementById("'+this.background.id+'"));', 600);
						}
					else
						document.body.removeChild(this.background);
					}
				if (this) {
					delete this;
					}
				}
	 };

