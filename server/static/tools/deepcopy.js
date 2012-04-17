function deepCopy(obj) {
	var copy = {};
	for (key in obj)
		copy[key] = obj[key];
	return copy;

//	if (typeof(obj) === '[object Object]') {
//		alert(copy);
//		}
//	if (typeof(obj) === '[object Array]') {
//		alert(Object.values(copy));
//		return Object.values(copy);
//		}
	}
