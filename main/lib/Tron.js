
function RotateTronCircle(CanvasId) {
	var alpha = 15;
	var width = 70;
	var height = 70;
	var canvas = document.getElementById(CanvasId);
	var context = canvas.getContext('2d');
	context.translate(width/2, height/2);
	context.rotate(alpha*Math.PI/180);
	context.translate(-width/2, -height/2);
	context.drawImage(img, 0, 0);
	TronCircleTimeout = window.setTimeout('rotateAroundCenter('+CanvasId+');', 50);
	window.onunload = function() { window.clearTimeout(TronCircleTimeout); }
	}

