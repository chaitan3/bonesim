# -*- coding: utf-8 -*-

def SBML():
	SBML = request.vars.SBML
	graph = Graph()
	graph.importSBML( SBML )
	return graph.exportJSON()

