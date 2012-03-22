# -*- coding: utf-8 -*-

def SBML():
	return Graph(SBML = request.vars.SBML).exportJSON()

