var jSBGN;

jSBGN.prototype.importSBML = function(file) {
  var obj = this;
  
  var formData = new FormData();
  formData.append('file', file);
  $.ajaxSetup({
    cache: false,
    async: false
  });
  
  $.ajax({
    url: env['biographer']+'/Put/UploadSBML',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function() {
      $.get(env['biographer']+'/Get/processedSBML', 
        function(data) {
          var json = JSON.parse(data);
          obj.nodes = json.nodes;
          obj.edges = json.edges;
          obj.rules = {};
          
          var i;
          for (i in obj.nodes) {
            var node = obj.nodes[i];
            
            if ((node.type == 'Compartment') || (node.type == 'Process'))
              obj.rules[node.id] = 'false';
            else
              obj.rules[node.id] = '';
          }
        }
      );
    }
  });
  
  $.ajaxSetup({
    async: true
  });
}
