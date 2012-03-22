function GET(URL) {
	var r = new XMLHttpRequest()
	r.open("GET", URL, false);
	r.send(null);
	return r.responseText;
	}

function replace_all(haystack, needle, replacement) {
	while ( haystack.indexOf(needle) > -1 ) {
		haystack = haystack.replace(needle, replacement);
		}
	return haystack;
	}
