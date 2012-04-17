function deepCopy(obj) {
	var copy = {};
	for (key in obj)
		copy[key] = obj[key];

	if (typeof(obj) === '[object Object]') {
		return copy;
		}
	if (typeof(obj) === '[object Array]') {
		return Object.values(copy);
		}
	}
