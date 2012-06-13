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
	key = 'points="'
	p = line.find(key)+len(key)
	q = line.find('"', p)
	points = line[p:q]
	def Round(n):
		n = n.group(0)
		if n.find('.') > -1:
			return n[:n.find('.')]
		if n.find(',') > -1:
			return n[:n.find('.')]
		return n
	import re
	points = re.sub('[0-9]*[\.,][0-9]*', Round, points)
	line = line[:p]+points+line[q:]
	return line

def prepareSVG(f):
	infile = open(f).read().split('\n')
	outfile = open(f, 'w')

	inside_node = False
	new_g = ''
	for line in infile:
		if '<polygon ' in line:
			line = WorkaroundChromiumIssue123607(line)
		if '"graph1"' in line:		# required for SVGPan.js
			line = line.replace('"graph1"', '"viewport"').replace('scale(1 1)', 'scale(0.7 0.7)')
		if inside_node:
			if not '<title>' in line:	# we don't need the <title>
				new_g += line+'\n'
			if '</g>' in line:		# node ends
				if '<text ' in new_g:	# not a process node, which don't have a label
					p = new_g.find('>', new_g.find('<text '))+1		# set ellipse id according to text label
					q = new_g.find('</text>', p)
					label = new_g[p:q]
					name = label.replace(' ','_')
					new_g = new_g.replace('fill="none"', 'id="'+name+'" fill="white" style="cursor:pointer"')
				outfile.write(new_g)
				inside_node = False
		else:
			if 'class="node"' in line:	# node begins
				inside_node = True
				new_g = line+'\n'
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

