# -*- coding: utf-8 -*-

def reset():
	model = deepcopy(session.bioGraph)
	del session.bioGraph
	model.resetBooleanNet()
	session.bioGraph = model
	print "reset"
	return None

def setState():
	print "set "+request.vars.id+" to "+request.vars.state
	return None

def iterate():
	model = deepcopy(session.bioGraph)
	del session.bioGraph
	model.iterateBooleanNet()
	session.bioGraph = model
	print "iterated"
	return None

def status():
	output = ''
	for node in session.bioGraph.Nodes:
		output += node.id+'\n'+str(node.data.booleanstate)+'\n'
	return output
