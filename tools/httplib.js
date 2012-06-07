function GET(URL, handler) {
	var r = new XMLHttpRequest();
	if (handler != null) {
		r.open("GET", URL, true);
		r.onreadystatechange = function() {
					if (this.readyState == this.DONE)
						handler(this.responseText);
					}
		r.send(form);
		}
	else	{
		r.open("GET", URL, false);
		r.send(null);
		return r.responseText;
		}
	}

function POST(URL, form, handler) {
	var r = new XMLHttpRequest();
	if (handler != null) {
		r.open("POST", URL, true);
		r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		r.onreadystatechange = function() {
					if (this.readyState == this.DONE)
						handler(this.responseText);
					}
		r.send(form);
		}
	else	{
		r.open("POST", URL, false);
		r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		r.send(form);
		return r.responseText;
		}
	}

