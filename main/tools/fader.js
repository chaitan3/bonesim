// from https://github.com/matthiasbock/javascript-website-effects/blob/master/fader.js

OpacityFader = function(element, start, stop, duration, delayStart) {
			var onestep = 6; // ms
			var steps = duration/onestep;
			var opacityStep = (stop-start)/steps;
			if (!delayStart)
				delayStart = 0;

			if (element.id === 'undefined' || element.id =='')
				element.id = Math.random();

			if ( start == 0 )	// become visible
				window.setTimeout("document.getElementById('"+element.id+"').style.visibility = 'visible';", delayStart);
			for (i=0; i<steps; i++) {
				window.setTimeout("document.getElementById('"+element.id+"').style.opacity = "+(start+i*opacityStep)+";", delayStart+i*onestep);
				}
			if ( stop == 0 )	// become invisible
				window.setTimeout("document.getElementById('"+element.id+"').style.visibility = 'hidden';", delayStart+duration);
			}

function NextColor(begin, current, end) {
        var newcolor = '#';
	var change_percent = 0.08;
	for (i=1; i<=5; i+=2) {	// R,B,G
		var a = parseInt(begin.substr(i, 2), 16);
		if ( isNaN(a) )
			var a = 0;
		var x = parseInt(current.substr(i, 2), 16);
		if ( isNaN(x) )
			var x = 0;
		var b = parseInt(end.substr(i, 2), 16);
		if ( isNaN(b) )
			var b = 0;
		if (b > a) {	// increase
			if (x < a || x > b)
				x = a;
			var p = (x-a)/(b-a);
			var y = Math.ceil(x + (b-a)*change_percent);
			if (y > b)
				var y = b;
			}
		else if (b < a) { // decrease
			if (x < b || x > a)
				var x = a;
			var p = (a-x)/(a-b);
			var y = Math.ceil(x - (a-b)*change_percent);
			if (y < b)
				var y = b;
			}
		else	var y = b;
		if (x == y)
			var y = b;
		newcolor += y.toString(16);
		}
	return newcolor;
	}

