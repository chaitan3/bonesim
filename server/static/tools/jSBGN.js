
jSBGN = {
	nodes:	[],
	edges:	[],

	appendNode: function() {
			},

	removeNode: function() {
			},

	getNodeById: function(id) {
			for (index in this.nodes) {
				node = this.nodes[index];
				if (node.id == id)
					return node;
				}
			return null;
			}
	}

