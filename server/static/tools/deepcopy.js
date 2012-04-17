function deepcopy(obj) {
	var copy = {};
	for (key in obj)
		copy[key] = obj[key];
	return copy;
	}
