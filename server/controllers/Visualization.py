# -*- coding: utf-8 -*-

def index():
	return redirect(URL(r=request, c="Workbench", f="index"))

def internal():
	return redirect(URL(r=request, c="Workbench", f="index"))

def example():									# Ben's example
	return dict()

def graphviz():									# graphviz
	if session.bioGraph is None:
		session.flash = "Unable to visualize: No graph is loaded. Import a model from BioModels.net ?"
		return redirect( URL(r=request, c="Import", f="BioModels")+"?returnto="+URL(r=request, c="Visualization", f="graphviz")+"&BioModelsID=8" )

	Map = ""								# create a HTML map of the nodes in the picture, so we click 'em
	image_width = 4863
	image_height = 1883
	nodes = []
	import sbo
	for node in session.bioGraph.Nodes:
		if not node.type == sbo.Compartment:
			left	= str(int(node.data.x))
			top	= str(int(node.data.y))
			width	= str(int(node.data.width))
			height	= str(int(node.data.height))
			if left > 0 and top > 0 and width > 0 and height > 0:
				label	= node.data.label
				if label in [None, '']:
					label = node.id
				Map 	+= '\t<div class=area id="'+node.id+'" style="left:'+left+'px; top:'+top+'px; width:'+width+'px; height:'+height+'px;" onClick="ChangeState(event);">'+label+'</div>\n'
				nodes.append(node.id)

	Boxes = ''
	comma = False
	for node in nodes:
		if comma:
			Boxes += ', '
		Boxes += '"'+node+'"'
		comma = True

	return dict( BoundingBoxes=Map, Boxes=Boxes )

