// from https://github.com/matthiasbock/javascript-website-effects/blob/master/fader.js

OpacityFader = {
		setup : function(element, start, stop, duration, delayStart) {
				var onestep = 1000; // ms
				var steps = duration/onestep;
				var opacityStep = (stop-start)/steps;

				var setVisible = function() {
							element.style.visibility = 'visible';
							}

				var setInvisible = function() {
							element.style.visibility = 'hidden';
							}

				var updateOpacity = function() {
							opacity = element.style['opacity']+opacityStep;
							element.style.opacity = opacity;
							}				

				if ( start == 0 )	// become visible
					window.setTimeout(setVisible, delayStart);
				for (i=0; i<steps; i++) {
					window.setTimeout(updateOpacity, delayStart+i*onestep);
					}
				if ( stop == 0 )	// become invisible
					window.setTimeout(setInvisible, delayStart+duration);
				}
		}

function FadeColor(begin, current, end) {
        newcolor = '#';
	for (i=1; i<=5; i+=2) {	// R,B,G
		a = parseInt(begin.substr(i, 2), 16);
		if ( isNaN(a) )
			a = 0;
		x = parseInt(current.substr(i, 2), 16);
		if ( isNaN(x) )
			x = 0;
		b = parseInt(end.substr(i, 2), 16);
		if ( isNaN(b) )
			b = 0;
		if (b > a) {	// increase
			if (x < a || x > b)
				x = a;
			p = (x-a)/(b-a);
			y = Math.ceil(x + (b-a)*0.03);
			if (y > b)
				y = b;
			}
		else if (b < a) { // decrease
			if (x < b || x > a)
				x = a;
			p = (a-x)/(a-b);
			y = Math.ceil(x - (a-b)*0.03);
			if (y < b)
				y = b;
			}
		else	y = b;
		if (x == y)
			y = b;
		newcolor += y.toString(16);
		}
	return newcolor;
	}

