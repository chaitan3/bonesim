function deepCopy(obj) {
	var copy = {};
	for (key in obj)
		copy[key] = obj[key];

	if (typeof(obj) === '[object Object]') {
		alert(copy);
		return copy;
		}
	if (typeof(obj) === '[object Array]') {
		alert(Object.values(copy));
		return Object.values(copy);
		}
	}
