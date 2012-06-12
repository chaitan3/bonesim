
jSBGN = function(nodes, edges) { // constructor
		this.nodes = [];
		if (nodes) this.nodes = nodes;
		this.edges = [];
		if (edges) this.edges = edges;
		}

// http://www.javascriptkit.com/javatutors/oopjs2.shtml

jSBGN.prototype.appendNode = function(node) {
				//this.nodes.push(Node); 		this doesn't work !!!
				this.nodes = this.nodes.concat([node]);
				}

jSBGN.prototype.removeNode = function(node) {
				for (index in this.nodes) {
					var node = this.nodes[index];
					if (node == Node) {
						this.nodes.drop(index);		// requires array.js
						break;
						}
					}
				}

jSBGN.prototype.appendEdge = function(edge) {
				//this.edges.push(edge);		this doesn't work!!!
				this.edges = this.edges.concat([edge]);
				}

jSBGN.prototype.getNodeById = function(id) {
				for (index in this.nodes) {
					var node = this.nodes[index];
					if (node.id == id) {
						return node;
						break;
						}
					}
				return null;
				}

jSBGN.prototype.getEdgeBySourceAndTargetId = function(sourceId, targetId) {
						for (index in this.edges) {
							var edge = this.edges[index];
							if (edge.source == sourceId && edge.target == targetId) {
								return edge;
								break;
								}
							}
						return null;
						}

jSBGN.prototype.hasNode = function(id) {
				return this.getNodeById(id) != null;
				}

jSBGN.prototype.exportJSON = function() {
				// export network with object links

				// without node.edges
				var _nodes = [];
				for (index in this.nodes) {
					var node = this.nodes[index];
					var newnode = {};
					newnode.id = node.id;
					newnode.data = node.data;
					newnode.type = node.type;
					_nodes = _nodes.concat([newnode]);
					}

				// without edge.sourceNode & edge.targetNode
				var _edges = [];
				for (index in this.edges) {
					var edge = this.edges[index];
					var newedge = {};
					newedge.id = edge.id;
					newedge.source = edge.source;
					newedge.target = edge.target;
					_edges = _edges.concat([newedge]);
					}

				return { nodes: _nodes, edges: _edges };
				}

jSBGN.prototype.exportJSONstring = function() {
					return JSON.stringify( this.exportJSON() );
					}
