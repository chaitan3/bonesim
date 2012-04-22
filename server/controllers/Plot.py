# -*- coding: utf-8 -*-

def graphviz():
	orphans = True
	filename = '/tmp/'+layout_using_graphviz(Graph(JSON=request.vars.network, KeepOrphans=orphans), image_output_folder="/tmp")
	svg = open(filename).read()
	os.remove(filename)
	p = svg.find('<svg ')
	return svg[p:]

