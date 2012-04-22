// from https://github.com/matthiasbock/javascript-website-effects/blob/master/fader.js

function setOpacity(id, opacity) {
        get(id).style.opacity = opacity;
        }

function FadeIn(id, time) {
        e = get(id);
        e.style.opacity = 0;
        e.style.visibility = 'visible';
        steps = time/20;
        delay = time/steps;
        for (i=1; i<=steps; i++) {
                window.setTimeout("setOpacity('"+id+"', "+i/steps+");", i*delay);
                }
        }

function FadeOut(id, time) {
        e = get(id);
        e.style.visibility = 'visible';
        e.style.opacity = 1;
        steps = time/20;
        delay = time/steps;
        for (i=1; i<=steps; i++) {
                window.setTimeout("setOpacity('"+id+"', "+(1-i/steps)+");", i*delay);
                }
        window.setTimeout("get('"+id+"').style.visibility = 'hidden';", time);
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

