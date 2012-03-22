# -*- coding: utf-8 -*-

def SBML():
	SBML = request.vars.File.file.read()

	graph = Graph()
	graph.importSBML( SBML )
	JSON = graph.exportJSON()

	return JSON

