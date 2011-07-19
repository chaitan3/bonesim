# -*- coding: utf-8 -*-

# TEMPORARY BUG WORKAROUND
import sys
hardcoded = "/var/www/web2py/applications/biographer/modules"
if not hardcoded in sys.path:
	sys.path.append(hardcoded)
import biographer
# END WORKAROUND

import os
from copy import deepcopy

def graphviz():
	if session.bioGraph is not None:
		server_object				= deepcopy( session.bioGraph )
		del session.bioGraph
		session.graphvizDOT, filename, cached	= server_object.exportGraphviz( folder=os.path.join(request.folder, "static/graphviz"), useCache=True, updateNodeProperties=True )
		session.bioGraph			= server_object
		session.graphvizURL			= URL(r=request, c="static/graphviz", f=filename)
		if cached:
			response.flash = "Graphviz layout loaded from cache"
		else:
			response.flash = "New layout created"
		return dict()
	else:
		response.flash = "You must import a Graph first !"
		return dict()

def Layout():
	graphviz()
	return dict()

def Visualization():
	graphviz()
	return dict()

