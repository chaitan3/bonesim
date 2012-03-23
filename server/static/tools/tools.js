function replace_all(haystack, needle, replacement) {
	while ( haystack.indexOf(needle) > -1 ) {
		haystack = haystack.replace(needle, replacement);
		}
	return haystack;
	}
