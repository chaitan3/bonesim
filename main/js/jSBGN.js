
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
  var ratio = $(window).width()/$(window).height();
  var w = 1e6;
  var h = w / ratio;
  var force = d3.layout.force()
    /*.charge(-2000)
    .linkDistance(100)
    .linkStrength(1)
    .gravity(0.1)*/
    .charge(-3500)
    .linkDistance(150)
    .linkStrength(0.5)
    .gravity(0.05)
    .nodes(this.nodes)
    .links(this.edges)
    .size([w, h])
  
  force.start();
  while(force.alpha() > 0.005) {
    force.tick();
  }
  force.stop();
}
