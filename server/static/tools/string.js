String.prototype.trim = function(needle, replacement)
				{
					var haystack = String(this);
					while ( haystack.indexOf(needle) > -1 ) {
						haystack = haystack.replace(needle, replacement);
						}
					return haystack;
				};

if (typeof(String.prototype.trim) === "undefined")
	{
	    String.prototype.trim = function() 
					    {
						return String(this).replace(/^\s+|\s+$/g, '');
					    };
	}
