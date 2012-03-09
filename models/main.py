#!/usr/bin/python
# -*- coding: iso-8859-15 -*-

# reload modules when changes are made
# see http://web2py.com/book/default/chapter/04#Accessing-the-API-from-Python-modules
from gluon.custom_import import track_changes
track_changes(True)

import sys
import os
from copy import deepcopy

# also import the class's modules!
hardcoded = request.folder + "/class"
if not hardcoded in sys.path:
	sys.path.append(hardcoded)
from graph import Graph
from defaults import progress

# the following lines shouldn't be necessary,
# since web2py automatically imports everything in /models
#from cache import *
#from biomodels import *
#from reactome import *

def reset_current_session():
	global session

	session.JSON = None				# reset
	session.SBML = None
	session.BioModelsID = None

	if session.bioGraph is not None:		# delete old graph
		del session.bioGraph

	from graph import Graph
	session.bioGraph = Graph(verbosity=progress)	# new graph


def import_JSON( JSONstring ):
	global session
	reset_current_session()
	session.bioGraph.importJSON( JSONstring )

def export_JSON():					# workaround for web2py bug
	global session
	session.bioGraph.exportJSON()
	temp = deepcopy( session.bioGraph )
	del session.bioGraph
	session.bioGraph = temp
	return session.bioGraph.JSON

def import_SBML( SBMLstring ):
	global session
	reset_current_session()
	session.bioGraph.importSBML( SBMLstring )


def import_BioModel( BioModelsID ):
	global session, request, db

	BioModelsID = BioModelsID.rjust(10, "0")	# adjust BioModel's ID
	print "BioModel requested: BIOMD"+BioModelsID

	model = BioModel_from_cache( BioModelsID )
	if model is None:
		print "Not in cache. Downloading ..."
		model = download_BioModel( BioModelsID )
		if model is None:
			print "Error: Download failed"
			session.flash = "Error: BioModel download failed"
			return False
		else:
			print "Downloaded successful."
			session.flash = "BioModel downloaded"
			BioModel_to_cache( model, BioModelsID )
	else:
		print "Loaded from cache."
		session.flash = "BioModel loaded from cache"
	
	reset_current_session()
	session.BioModelsID = BioModelsID
	session.SBML = model
	session.bioGraph.importSBML( session.SBML )
	return model


def import_Reactome( ReactomeStableIdentifier ):
	global session, request, db

	print "Request for RSI:"+ReactomeStableIdentifier

	model = Reactome_from_cache( ReactomeStableIdentifier )
	if model is None:
		print "Not in cache. Downloading ..."
		model = download_Reactome( ReactomeStableIdentifier )
		if model is None:
			print "Error: Download failed"
			session.flash = "Error: Reactome download failed"
			return False
		else:
			print "Downloaded successful."
			session.flash = "Reactome model downloaded"
			Reactome_to_cache( model, ReactomeStableIdentifier )
	else:
		print "Loaded from cache."
		session.flash = "Reactome model loaded from cache"

	reset_current_session()
	session.ST_ID = ReactomeStableIdentifier
	session.SBML = model
	session.bioGraph.importSBML( session.SBML )
	return model

