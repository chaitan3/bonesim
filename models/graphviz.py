#!/usr/bin/python
# -*- coding: iso-8859-15 -*-

# wrapper for graphviz

def mkdir_and_parents( path ):
	import os

	fullpath = ""
	for part in path.split("/"):
		fullpath += part+"/"
		if (len(fullpath) > 1) and (not os.path.exists(fullpath)):
			os.mkdir(fullpath)

def prepareSVG(f):
	infile = open(f).read().split('\n')
	outfile = open(f, 'w')

	inside_node = False
	replacement = ''
	for line in infile:
		if inside_node:
			if '</g>' in line:
				p = replacement.find('>', replacement.find('<text '))+1
				q = replacement.find('</text>', p)
				label = replacement[p:q]
				name = label.replace(' ','_')
				replacement = replacement.replace('class="node"', 'class="node" onclick="parent.'+name+' = ! parent.'+name+'; parent.NodeClick(\''+name+'\');"')
				replacement = replacement.replace('fill="none"', 'id="'+name+'" fill="white" style="cursor:pointer"') # onclick="parent.'+name+' = ! parent.'+name+'; parent.NodeClick(\''+name+'\');"')
				outfile.write(replacement+line+'\n')
				inside_node = False
			else:
				replacement += line+'\n'
		else:
			if 'class="node"' in line:
				inside_node = True
				replacement = line+'\n'
			else:
				outfile.write(line+'\n')


def layout_using_graphviz(graph, execution_folder="/tmp", image_output_folder="/tmp", algorithm="dot"):

	import os, pygraphviz
	from defaults import info

	mkdir_and_parents(execution_folder)
	mkdir_and_parents(image_output_folder)

	graphviz_model = graph.export_to_graphviz()

	graph.log(info, "Executing graphviz ...")

	out_filename = graph.MD5+".svg"
	out = os.path.join(image_output_folder, out_filename)
	if os.path.exists(out):
		os.remove(out)

#	graphviz_model.dpi = 70;
	graphviz_model.layout( prog=algorithm )
	graphviz_model.draw( out )
	prepareSVG( out )

	graph.graphviz_layout = graphviz_model.string()
	graph.log(info, "graphviz completed.")

	graph.import_from_graphviz( graph.graphviz_layout )

	return out_filename

