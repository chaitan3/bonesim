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
				Map 	+= '\t<div class=area id="'+node.id+'" style="left:'+left+'px; top:'+top+'px; width:'+width+'px; height:'+height+'px;" onClick="javascript:'+node.id+' = ! '+node.id+';"></div>\n'
				nodes.append(node)

	Boxes = ''
	comma = False
	for node in nodes:
		if comma:
			Boxes += ', '
		Boxes += '"'+node.id+'"'
		comma = True

	reset = ''
	updateBoxes = ''
	for node in nodes:
		reset += "\t\t"+node.id+" = true;\n"
		updateBoxes += "\t\tif ( "+node.id+" )	document.getElementById('"+node.id+"').style.background = green\n"
		updateBoxes += "\t\telse		document.getElementById('"+node.id+"').style.background = red;\n"

	updateRules = ''
	shiftRules = ''
	for line in session.bioGraph.BooleanNet.split('\n'):
		if line.strip() != '' and line[0] != '#' and line.find('=') > -1 and line[-5:] not in [' True', '=True', 'False']:
			updateRules += '\t\t'+line.replace(' and ',' && ').replace(' or ',' || ').replace(' not ',' ! ').replace('*','_new')+';\n'
			node = line.split('=')[0].strip()
			shiftRules += '\t\t'+node.replace('*','')+' = '+node.replace('*','_new')+';\n'


	return dict( BoundingBoxes=Map, Boxes=Boxes, reset=reset, updateRules=updateRules, shiftRules=shiftRules, updateBoxes=updateBoxes )

