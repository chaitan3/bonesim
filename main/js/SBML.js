var jSBGN, serverURL;

jSBGN.prototype.importSBML = function(file) {
  var obj = this;
  
  var formData = new FormData();
  formData.append('file', file);
  $.ajaxSetup({
    cache: false,
    async: false
  });
  
  $.ajax({
    url: serverURL + '/Put/UploadSBML',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function() {
      $.get(serverURL + '/Get/processedSBML', 
        function(data) {
          var json = JSON.parse(data);
          obj.nodes = json.nodes;
          obj.edges = json.edges;
          obj.rules = {};
          
          var i;
          for (i in obj.nodes) {
            var node = obj.nodes[i];
            
            if ((node.type == 'Compartment') || (node.type == 'Process'))
              obj.rules[node.id] = '';
            else
              obj.rules[node.id] = 'update';
          }
        }
      );
    }
  });
  
  $.ajaxSetup({
    async: true
  });
}
