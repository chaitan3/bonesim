# -*- coding: utf-8 -*-

def graphviz():
	return 'static/graphviz/'+layout_using_graphviz( Graph(JSON=request.vars.network), image_output_folder=os.path.join(request.folder, "static/graphviz") )

