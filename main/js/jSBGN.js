
jSBGN = function() { // constructor
  this.nodes = [];
  this.edges = [];
}

jSBGN.prototype.redraw = function(graph) {
  var all_drawables = graph.drawables();
  var i, j;
  for (i = 0; i < this.nodes.length; i++) {
    j = this.nodes[i];
    all_drawables[j.id].absolutePositionCenter(j.x, j.y);
  }
  for (i = 0; i < this.edges.length; i++) {
    j = this.edges[i];
    all_drawables[j.id].recalculatePoints();
  }
}

jSBGN.prototype.connect = function() {
  var i, j;
  for (i in this.edges) {
    for (j in this.nodes) {
      if (this.edges[i].source == this.nodes[j].id)
        this.edges[i].source = this.nodes[j];
      if (this.edges[i].target == this.nodes[j].id)
        this.edges[i].target = this.nodes[j];
    }
  }
}
          
jSBGN.prototype.layout = function(graph) {
  var canvas = 3000;
  var force = d3.layout.force()
    .charge(-2000)
    .linkDistance(100)
    .linkStrength(0.2)
    .gravity(0.05)
    .nodes(this.nodes)
    .links(this.edges)
    .size([canvas, canvas])
  
  force.start();
  while(force.alpha() > 0.005) {
    force.tick();
  }
  force.stop();
}
