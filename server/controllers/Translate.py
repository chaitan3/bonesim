# -*- coding: utf-8 -*-

def SBML():
	return Graph( SBML = request.vars.data ).exportJSON()

def BooleanNetwork():
        return Graph( BooleanNetwork = request.vars.data ).exportJSON()

