
newNode = function() {
		return { id: '', data: {}, edges: [] };
		}

newEdge = function() {
		return { id: '', source: '', target: '', sourceNode: null, targetNode: null };
		}

jSBGN = ( function() {
		return  {
			create:     function(nodes, edges) {	// constructor
					if (nodes) this.nodes = nodes;
					else	this.nodes = [];
					if (edges) this.edges = edges;
					else	this.edges = [];

					this.appendNode = jSBGN.appendNode;
					this.removeNode = jSBGN.removeNode;
					this.appendEdge = jSBGN.appendEdge;
					this.getNodeById = jSBGN.getNodeById;
					this.getEdgeBySourceAndTargetId = jSBGN.getEdgeBySourceAndTargetId;
					this.hasNode = jSBGN.hasNode;
					this.exportJSON = jSBGN.exportJSON;
					},

			appendNode: function(Node) {
					this.nodes.push(Node);
					},

			removeNode: function(Node) {
					for (index in this.nodes) {
						node = this.nodes[index];
						if (node == Node) {
							this.nodes.drop(index);		// requires array.js
							break;
							}
						}
					},

			appendEdge: function(Edge) {
					this.edges.push(Edge);
					},

			getNodeById: function(id) {
					for (index in this.nodes) {
						node = this.nodes[index];
						if (node.id == id)
							return node;
						}
					return null;
					},

			getEdgeBySourceAndTargetId: function(sourceId, targetId) {
					for (index in this.edges) {
						edge = this.edges[index];
						if (edge.source == sourceId && edge.target == targetId)
							return edge;
						}
					return null;
					},

			hasNode: function(id) {
					return this.getNodeById(id) != null;
					},

			exportJSON: function() {
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
			};
		     }
	   ) ();

