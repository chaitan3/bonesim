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
	return session.bioGraph.exportBooleanNet()
