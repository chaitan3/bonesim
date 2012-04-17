
newNode = function() {
		return { id: '', data: {} };
		}

jSBGN = {
	nodes:	[],
	edges:	[],

	appendNode: function(Node) {
			},

	removeNode: function(Node) {
			},

	getNodeById: function(id) {
			for (index in this.nodes) {
				node = this.nodes[index];
				if (node.id == id)
					return node;
				}
			return null;
			},

	hasNode: function(id) {
			return this.getNodeById(id) != null;
			}
	}

