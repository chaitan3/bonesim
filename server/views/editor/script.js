//-------------------------------------------
//-------------------------------------------
//config
var url_undo_push = '{{=URL("undo_push")}}';
var url_undo = '{{=URL('undo.json')}}';
var url_redo = '{{=URL('redo.json')}}';
var url_layout = '{{=URL('layout.json')}}';
var url_import = '{{=URL('import_graph.json')}}';

//-------------------------------------------
//-------------------------------------------
function save(action) {
    if (action == 'manual' || action == 'auto'){
        var now = new Date();
        var pretty_date = [ now.getFullYear(), '-', now.getMonth() + 1, '-', now.getDate(), ' ', now.getHours(), ':', now.getMinutes(), ':', now.getSeconds() ].join('');
        undoPush(action+' save '+pretty_date);
    }else if (action != undefined){
        undoPush(action);
    }
}
var t;
var timer_is_on=0;
var intervall = 60000;//every 60 seconds
var last_save = '';
function autosaveHeartBeat(no_save) {
    if (no_save != true){
        //autosave json graph if graph was modified
        save('auto');
    }
    t=setTimeout("autosaveHeartBeat()",intervall);
}
function doHeartBeat() {
    if (!timer_is_on) {
      timer_is_on=1;
      autosaveHeartBeat(true);
      }
}
//-------------------------------------------
function redrawGraph(graph_json){
        all_drawables = graph.drawables(); 
        for (var key in all_drawables) {
            all_drawables[key].remove();
        }
        delete graph;
        $('#canvas').html(''); 
        graph = new bui.Graph($('#canvas')[0]);
        bui.importFromJSON(graph, graph_json);
}
//-------------------------------------------
function showUndoRedo(){
    if(history_undo.length > 0){
        $('#undo').removeClass('disabled');
        var newArray = history_undo.slice();
        $('#undo>div').html(newArray.reverse().join('<br/>'));
    }else{
        $('#undo').addClass('disabled');
        $('#undo>div').html('undo');
    }
    if(history_redo.length > 0){
        $('#redo').removeClass('disabled');
        $('#redo>div').html(history_redo.join('<br/>'));
        var newArray = history_redo.slice();
        $('#redo>div').html(newArray.reverse().join('<br/>'));
    }else{
        $('#redo').addClass('disabled');
        $('#redo>div').html('redo');
    } 
}
//-------------------------------------------
function undoPush(action){
    var jsong = JSON.stringify(graph.toJSON());
    if (jsong == last_save){
        $('.flash').html('Saved: nothing changed, woooah').fadeIn().delay(800).fadeOut();
        return false;
    }
    $.ajax({
        url: url_undo_push,
        data : {
            graph: jsong,
            action: action,
        },
        success: function( data ) {
            $('.flash').html('Saved '+action).fadeIn().delay(800).fadeOut();
            undoRegister(action, jsong)
            return true;
        }
    });
}
function undoRegister(action, graph){
    history_undo.push(action)
    history_redo = [];
    showUndoRedo();
    last_save = graph
}
//-------------------------------------------
function undo(){
    $.getJSON(url_undo, function(data) {
        redrawGraph(data);
        var action = history_undo.pop();
        history_redo.push(action);
        showUndoRedo();

    });
}
function redo(){
    $.getJSON(url_redo, function(data) {
        var action = history_redo.pop();
        history_undo.push(action);
        showUndoRedo();
        redrawGraph(data.graph);
    });
}
//-------------------------------------------
var cur_mode = false;
function setMode(mode){
    if (mode == cur_mode) return 
    cur_mode = mode;
    $('#canvas').unbind('mousemove');
    $('.follow').hide();
    $('.active').removeClass('active');
    var mode2id = {'del':'cross', 'edit':'wrench', 'Edge':'edge', 'Spline':'spline', 'focus':'focus'}
    if ((mode == 'del')||(mode == 'edit')||(mode == 'Edge')||(mode == 'Spline')||(mode == 'focus')){
        $('#'+mode).addClass('active');
        $('#follow_'+mode2id[mode]).show();
        $("#canvas").mousemove(function(e){
            $('#follow_'+mode2id[mode]).css('top', e.clientY+15).css('left', e.clientX+15);
        });
    }else if (mode == false){
        $('#cursor').addClass('active');
    }
}
//-------------------------------------------
var selected_nodes = [];
function drawableSelect(drawable, select_status) {
    //alert('drawableSelect');
    if ((cur_mode == 'Edge')||(cur_mode == 'Spline')){
        if(drawable.drawableType()=='node') selected_nodes.push(drawable);
        if (selected_nodes.length>=2){
            //draw edge now
            //new_edge = graph.add(bui[$('#select_edge_spline').val()])
            new_edge = graph.add(bui[cur_mode])
                    .source(selected_nodes[0])
                    .target(selected_nodes[1])
                    .visible(true);
            if(cur_mode=='Spline') new_edge.setSplineHandlePositions([
                {x:selected_nodes[0].position().x-10,y:selected_nodes[0].position().y-20},
                {x:selected_nodes[1].position().x-10,y:selected_nodes[1].position().y-20}
                ], 300);
            //set click listener on new edge
        //FIXME this crashes, but it should work?
        //script.js:137Uncaught TypeError: Cannot read property 'ListenerType' of undefined
            //new_node.bind(bui.abstractLine.ListenerType.click, drawableSelect);

            edgeModal(new_edge, 'created '+cur_mode);
            selected_nodes = []
        }
    } else if (cur_mode == 'edit'){
        if(drawable.drawableType()=='edge'){
            edgeModal(drawable, 'edited edge');
        } else {
            var label = 'Complex';
            if(drawable.identifier()!='Complex') label = drawable.label();
            nodeModal(drawable, 'edited node '+label);
        } 
    } else if (cur_mode == 'del'){
        drawable.remove();
        undoPush('deleted '+drawable.drawableType());
    } else if (cur_mode == 'focus'){
        if(drawable.drawableType()=='node') bui.util.alignCanvas(graph, drawable.id());
    }
}
//-------------------------------------------
function nodeModal (drawable, action) {
    //do not add lable to complex but anything else
    $('#action').html(action);
    if(drawable.identifier()!='Complex'){
        $('#node_label_row').show();
        $('#node_label').val(drawable.label());
    }else{
        $('#node_label_row').hide()
    }
    //-----------------
    $('.current_id').attr('id', drawable.id());
    $("#node_modal_input").modal({
        overlayClose:true,
        opacity:20,
        onClose: function(){
            if(drawable.identifier()!='Complex'){
                if ( $('#node_label').val() != '' ) drawable.label($('#node_label').val()).adaptSizeToLabel();
            }
            $('.unit_of_information').each(function(){
                if($(this).val()){
                    graph.add(bui.UnitOfInformation)
                    //.position(-10, -10)//TODO do we need this
                    .parent(drawable)
                    .label($(this).val())
                    .adaptSizeToLabel(true)
                    .visible(true);
                }
            }); 
            if(($('input[name="node_color"]:checked').val() != 'none')&&($('input[name="node_color"]:checked').val() != undefined)){
                drawable.removeClass();
                drawable.addClass($('input[name="node_color"]:checked').val());
            }
            save($('#action').html());
            $.modal.close();
        }
    });
    //=========================
    $('#node_modal_input').keydown(function(event){
        if(event.keyCode == 13){
        $.modal.close();
            event.preventDefault();
            return false;
        }
    });
}
//-------------------------------------------
function edgeModal (drawable, action) {
    //do not add lable to complex but anything else
    $('#action').html(action);
    $('#marker_type').html('');
    //-----------------
    $('.current_id').attr('id', drawable.id());
    $("#edge_modal_input").modal({
        overlayClose:true,
        opacity:20,
        onClose: function(){
            if($('#marker_type').html() != ''){
                if($('#edge_marker').val() !='none'){
                    drawable.marker(bui.connectingArcs[$('#marker_type').html()].id);
                }
            }
            save($('#action').html());
            $.modal.close();
        }
    });
    //=========================
    /*$('#edge_modal_input').keydown(function(event){
        if(event.keyCode == 13){
        $.modal.close();
            event.preventDefault();
            return false;
        }
    });*/
}
//-------------------------------------------
function placeholdersVisible(visible){
    var all_drawables = graph.drawables();
    for (var key in all_drawables) {
        drawable = all_drawables[key]
            if (drawable.drawableType()=='node'){
                drawable.placeholderVisible(visible);
            }
    }
}
//-------------------------------------------
var canvaspos = null;
var graph = null;
function dropFkt(event, ui, element){
    if(ui.helper.hasClass('node_helper')){
        //calculate position of new node
        var pos_top = ui.offset.top-canvaspos.top;
        var pos_left = ui.offset.left-canvaspos.left;
        //set size of new node
        var size = {};
        if(ui.helper.attr('id')=='Process'){
            size = {h:20, w:20};
        }else if((ui.helper.attr('id')=='Compartment')||(ui.helper.attr('id')=='Complex')){
            size = {h:100, w:100};
        }else {
            size = {h:50, w:50};
        }
        //create new node
        new_node = graph.add(bui[ui.helper.attr('id')])
            .position(pos_left, pos_top)
            .size(size.h, size.w)
            .visible(true)
        //add parent if the drop is within a container like complex or compartment
        if ($(element).attr('id').indexOf('placeholder') == 0){
            var drawable_parent = graph.drawables()[$(element).attr('id').substring(12)]
                new_node.parent(drawable_parent)
                //alert('parent_id '+parent_id);
                if (drawable_parent.identifier() == 'Complex'){
                    drawable_parent.tableLayout();
                } else {
                    pos_top = pos_top-drawable_parent.position().y
                        pos_left = pos_left-drawable_parent.position().x
                        new_node.position(pos_left, pos_top)
                }
        }
        //-----------------
        nodeModal(new_node, 'created '+ui.helper.attr('id'));
        //-----------------
        //set click listener on new node
        new_node.bind(bui.Node.ListenerType.click, drawableSelect, 'node_select');
        //set droppable listener on new node
        $('#placeholder_'+new_node.id()).droppable({ 
            hoverClass: 'drop_hover',
            over : function(){$('#canvas').droppable("disable");},
            out : function(){$('#canvas').droppable("enable");},
            drop: function(event, ui){dropFkt(event, ui, this);},
        });
        //make all drawables placeholders invisible
        placeholdersVisible(false);
        $('#canvas').droppable("enable");
    }
}
function layout(algorithm){
    $.getJSON(url_layout+'?layout='+algorithm, function(data) {
        history_undo.push(data.action);
        showUndoRedo();
        bui.importUpdatedNodePositionsFromJSON(graph, data.graph, 300)
        //redrawGraph(data.graph);
    });
}
//-------------------------------------------
$(document).ready(function() {
    showUndoRedo();
    //=========================
    $('#align_vertical, #align_hoizontal, #align_left, #align_top, #align_right, #align_bottom').click(function(){
        var all_drawables = graph.drawables();
        var pos = undefined;
        for (var key in all_drawables) {
            drawable = all_drawables[key]
            if ((drawable.drawableType()=='node')&&drawable.placeholderVisible()){
                if(pos === undefined){
                    pos = drawable.absolutePosition();
                }else{
                    if($(this).attr('id')=='align_hoizontal'){
                        drawable.absolutePosition(drawable.absolutePosition().x,pos.y);
                    }else if($(this).attr('id')=='align_vertical'){
                        drawable.absolutePosition(pos.x, drawable.absolutePosition().y);
                    }else if($(this).attr('id')=='align_left'){
                        drawable.absolutePosition(drawable.absolutePosition().x,pos.y);
                    }else if($(this).attr('id')=='align_top'){
                        drawable.absolutePosition(pos.x, drawable.absolutePosition().y);
                    }else if($(this).attr('id')=='align_right'){
                        drawable.absolutePosition(pos.x, drawable.absolutePosition().y);
                    }else if($(this).attr('id')=='align_bottom'){
                        drawable.absolutePosition(pos.x, drawable.absolutePosition().y);
                    }
                }
            }
        }
    });
    //=========================
    $('#canvas').resizable();
    //=========================
    $('#clear').click(function(){
        redrawGraph({nodes:[],edges:[]});
        //graph.clear();//FIXME this does not work 
    });
    //=========================
    $('#layout_grahviz').click(function(){
        layout('graphviz');
    });
    //=========================
    $('#layout_biographer').click(function(){
        layout('biographer');
    });
    //=========================
    $('#undo').click(function(){
        undo();
    });
    //=========================
    $('#redo').click(function(){
        redo();
    });
    //=========================
    $('#add_unit_of_information').click(function(){
        $('#uoi_group').append(' <br/><input type="text" placeholder="mt:prot" class="unit_of_information" /> ');
        $('#simplemodal-container').css('height', parseInt($('#simplemodal-container').css('height'))+20);
    });
    //=========================
    $('.load').click(function(){
        $.ajax({
            url: url_import,
            type: 'POST',
            dataType: 'json',
            data : {
                type : $(this).attr('id'), 
                identifier : $('#'+$(this).attr('id')+'_input').val()
            },
            success: function( data ) {
                undoRegister(data.action, data.graph)
                redrawGraph(data.graph)
                $.modal.close()
                return true;
            },
            error: function(xhr, textStatus, errorThrown) {
                $.modal.close();
                jQuery('.flash').html(textStatus+' '+xhr.responseText).fadeIn();
                return true;
            }
        });

    });
    //=========================
    $("#import_file_input").change(function(){
        $('#import_form').submit();
    });
    //===
    $('#import_file').click(function() {
        modal = $("#import_file_modal_input").modal({
            overlayClose:true,
            opacity:20,
        });
    });
    //=========================
    $('#load_json_string').click(function(){
        redrawGraph();
        undoPush('loaded graph from JSON string');
        $.modal.close()
    });
    //===
    $('#import_str').click(function() {
        modal = $("#import_string_modal_input").modal({
            overlayClose:true,
            opacity:20,
        });
    });
    //=========================
    $('.scale').click(function() {
        var rate = bui.util.toNumber($(this).data('rate'));
        graph.scale(graph.scale() + rate);
        return false;
    });
    //=========================
    $('#scale1').click(function() {
        graph.scale(1);
    });
    //=========================
    $('#fit_to_screen').click(function() {
        graph.fitToPage();
        return false;
    });
    //=========================
    $('h3.section').click(function(){
        $(this).parent().find('table').slideToggle();
        if($(this).hasClass('up')){
            $(this).removeClass('up').addClass('down') 
        }else{
            $(this).removeClass('down').addClass('up');
        }
    });
    //=========================
    $('#edit_all_nodes, #edit_no_nodes').click(function(){
            var visible = $(this).attr('id')=='edit_all_nodes';
            placeholdersVisible(visible);
    });
    //=========================
    $('.tools_click li').click(function(){
        if($(this).attr('id')=='cursor'){
            setMode(false);
        }else{
            setMode($(this).attr('id'));
        }
    });
    //=========================
    $('.marker_select').click(function(){
        $('#marker_type').html($(this).attr('id'))
    $.modal.close();
    });
    //=========================
    $('#close_modal_input').click(function(){
        $.modal.close(); 
    });
    //=========================
    $('#save_to_session').click(function(){
        save('manual');
    });
    //=========================
    $('#export_json').click(function(){
        //alert(JSON.stringify(graph.toJSON()));
        $('#export_form').html('<input type="hidden" name="json" value=\''+JSON.stringify(graph.toJSON())+'\' />').submit();
    });
    //=========================
    $('#export_svg').click(function(){
        //alert($('#canvas svg').parent().html());
        $('#export_form').html('<input type="hidden" name="svg" value=\''+$('#canvas svg').parent().html()+'\' />').submit();
    });
    //=========================
    $('#export_other').click(function() {
        modal = $("#export_file_modal_input").modal({
            overlayClose:true,
            opacity:20,
        });
    });
    //===
    $("#export_format_select").change(function(){
    	if($('#export_format_select').val() != '... choose'){
        	$('#export_form').html('<input type="hidden" name="format" value=\''+$('#export_format_select').val()+'\' /><input type="hidden" name="svg_data" value=\''+$('#canvas svg').parent().html()+'\' />').submit();
	}
    });
    //=========================
    canvaspos = $('#canvas').position();
    $('.node').draggable({
    zIndex: 2,
    //revert: true, 
    //grid: [ 20,20 ],//does not work, need aling functions
    helper: function() {return '<img src="/{{=request.application}}/static/images/editor/'+$(this).attr('id')+'_helper.png" id="'+$(this).attr('id')+'" class="node_helper"/>'},
    start: function() {
        setMode(false);
        //make all drawables placeholders visible
        var all_drawables = graph.drawables();
        for (var key in all_drawables) {
            drawable = all_drawables[key]
            if (((drawable.identifier()=='Complex')&& !$(this).hasClass('no_drop_complex'))||(drawable.identifier()=='Compartment')){
            drawable.placeholderVisible(true);
            }else if (drawable.drawableType()=='node'){
            drawable.placeholderVisible(false);
            }
        }
        }, 
    });
});
