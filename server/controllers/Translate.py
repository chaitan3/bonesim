# -*- coding: utf-8 -*-

def SBML():
	return Graph(SBML = request.vars.SBML).exportJSON()

def BooleanNetwork():
        return Graph( BooleanNetwork = request.vars.Network ).exportJSON()

