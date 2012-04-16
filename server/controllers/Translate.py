# -*- coding: utf-8 -*-

def SBML():
	return Graph(SBML=request.vars.data).exportJSON()

def BooleNet():
        return Graph(BooleNet=request.vars.data).exportJSON()

