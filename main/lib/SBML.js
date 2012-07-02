
jSBGN.prototype.importSBML = function(file, guessSeed) {
	var i, json;
  var obj = this;
  
  var formData = new FormData();
  formData.append('file', file);
  $.ajax({
    url: env['biographer']+'/Put/UploadSBML',
    type: 'POST',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    success: function() {
      $.get(env['biographer']+'/Get/processedSBML', 
        function(data) {
          json = JSON.parse(data);
          obj.nodes = json.nodes;
          obj.edges = json.edges;
          
          for (i in obj.nodes) {
            var node = obj.nodes[i];
            node.simulation = {
              myState : getInitialSeed(),	
              update : true,
              updateRule : ''
            };
            if ((node.type == 'Compartment') || (node.type == 'Process')) {
              node.simulation.myState = false;
              node.simulation.update = false;
            }
          }
          if (guessSeed)
            obj.applyGuessSeed();
          else
            importNetwork(obj);
        }
      );
    }
  });
}

jSBGN.prototype.applyGuessSeed = function() {
  var seed, node;
  var obj = this;
  
  $.get(env['biographer']+'/Simulate/InitialSeed', 
    function(data) {
      seed = JSON.parse(data);
      for (i in obj.nodes) {
        node = obj.nodes[i];
        if (node.simulation.update) {
          if(seed[node.id])
            node.simulation.myState = true;
          else
            node.simulation.myState = false;
        }
      }
      importNetwork(obj);
    }
  );
}
