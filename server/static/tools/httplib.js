function GET(URL) {
	var r = new XMLHttpRequest();
	r.open("GET", URL, false);
	r.send(null);
	return r.responseText;
	}

function POST(URL, form) {
	var r = new XMLHttpRequest();
	r.open("POST", URL, false);
	r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	r.send(form);
	return r.responseText;
	}

