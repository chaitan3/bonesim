
newNode = function() {
		return { id: '', data: {}, edges: [] };
		}

newEdge = function() {
		return { id: '', source: '', target: '', sourceNode: null, targetNode: null };
		}

jSBGN = function(nodes, edges) { // constructor
		this.nodes = [];
		if (nodes) this.nodes = nodes;
		this.edges = [];
		if (edges) this.edges = edges;
		}

// http://www.javascriptkit.com/javatutors/oopjs2.shtml

jSBGN.prototype.appendNode = function(Node) {
				this.nodes.push(Node);
				}

jSBGN.prototype.removeNode = function(Node) {
				for (index in this.nodes) {
					node = this.nodes[index];
					if (node == Node) {
						this.nodes.drop(index);		// requires array.js
						break;
						}
					}
				}

jSBGN.prototype.appendEdge = function(Edge) {
				this.edges.push(Edge);
				}

jSBGN.prototype.getNodeById = function(id) {
				for (index in this.nodes) {
					node = this.nodes[index];
					if (node.id == id)
						return node;
					}
				return null;
				}

jSBGN.prototype.getEdgeBySourceAndTargetId = function(sourceId, targetId) {
						for (index in this.edges) {
							edge = this.edges[index];
							if (edge.source == sourceId && edge.target == targetId)
								return edge;
							}
						return null;
						}

jSBGN.prototype.hasNode = function(id) {
				return this.getNodeById(id) != null;
				}

jSBGN.prototype.exportJSON = function() {
				// remove node.edges, edge.sourceNode, edge.targetNode for export
				var _nodes = this.nodes;			// requires object.js
	//			alert(_nodes);
				var _edges = this.edges;
				for (index in _nodes) {
					node = _nodes[index];
					if (typeof(node.edges) != undefined)
						delete node.edges;
					}
				for (index in _edges) {
					edge = _edges[index];
					if (typeof(edge.sourceNode) != undefined)
						delete edge.sourceNode;
					if (typeof(edge.targetNode) != undefined)
						delete edge.targetNode;
					}
				return { nodes: _nodes }; //, edges: _edges };
				}

