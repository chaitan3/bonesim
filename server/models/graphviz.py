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

def WorkaroundChromiumIssue123607(line):
	import re
	key = 'points="'
	p = line.find(key)+len(key)
	q = line.find('"', p)
	points = line[p:q]
	numbers = re.findall('[0-9]+\.[0-9]+', points)
	for number in numbers:
		points = points.replace(number, str(int(float(number))))
	line = line[:p]+points+line[q:]
	return line

def prepareSVG(f):
	infile = open(f).read().split('\n')
	outfile = open(f, 'w')

	inside_node = False
	replacement = ''
	for line in infile:
		if '<polygon ' in line:
			line = WorkaroundChromiumIssue123607(line)
		if '"graph1"' in line:		# required for SVGPan.js
			line = line.replace('"graph1"', '"viewport"').replace('scale(1 1)', 'scale(0.7 0.7)')
		if inside_node:
			if '</g>' in line:		# node ends
				p = replacement.find('>', replacement.find('<text '))+1		# set ellipse id according to text label
				q = replacement.find('</text>', p)
				label = replacement[p:q]
				name = label.replace(' ','_')
				replacement = replacement.replace('fill="none"', 'id="'+name+'" fill="white" style="cursor:pointer"')
				outfile.write(replacement+'</g>\n')
				inside_node = False
			else:
				replacement += line+'\n'
		else:
			if 'class="node"' in line:	# node begins
				inside_node = True
				replacement = line+'\n'
			else:
				outfile.write(line+'\n')


def layout_using_graphviz(graph, execution_folder="/tmp", image_output_folder="/tmp", algorithm="dot"):

	import os
	try:
		import pygraphviz
	except ImportError:
		print 'Import Error: python-graphviz'
		return None
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

#	graph.graphviz_layout = graphviz_model.string()		# discard for now
	graph.log(info, "graphviz completed.")

#	graph.import_from_graphviz( graph.graphviz_layout )	# discard for now

	return out_filename

