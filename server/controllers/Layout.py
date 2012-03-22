# -*- coding: utf-8 -*-

def biographer():
	graph = Graph()
	graph.importJSON( request.vars.JSON.read() )
	layout( graph, path_to_layout_binary=os.path.join(request.folder, "layout/build/layout
"), execution_folder=os.path.join(request.folder, "cache") )
	graph.import_from_Layouter( layout )

	return graph.exportJSON()

