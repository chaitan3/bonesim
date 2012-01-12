# -*- coding: utf-8 -*-

import os, sys, httplib

# QUICKFIX
#hardcoded = request.folder + "/modules"
#if not hardcoded in sys.path:
#	sys.path.append(hardcoded)

import biographer


#################### JSON ####################

def importJSON( JSONstring ):
	global session
	reset_current_session()
	session.bioGraph.importJSON( JSONstring )

def JSON():									# function: import JSON
	if request.env.request_method == "GET":
		return dict()

	if request.env.request_method == "POST":
		if request.vars.File != "":					# a file was uploaded
			session.JSON = request.vars.File.file.read()
			session.flash = request.vars.File.filename+" retrieved and parsed."
		else:								# the example JSON was requested
			session.JSON = open( os.path.join(request.folder, "static/examples/example.json") ).read()
			session.flash = "Example JSON loaded."

		importJSON( session.JSON )					# import JSON

		return redirect( URL(r=request, c="Workbench", f="index") )

def JSONdebug():								# function: show JSON details
	return dict()


#################### SBML ####################

def importSBML( SBMLstring ):
	global session
	reset_current_session()
	session.bioGraph.importSBML( SBMLstring )

def SBML():									# function: import SBML
	if request.env.request_method == "GET":
		return dict()

	if request.env.request_method == "POST":
		session.JSON = ""
		if request.vars.File != "":					# a file was uploaded
			session.SBML = request.vars.File.file.read()
			session.flash = "SBML uploaded."
		else:								# the example was requested
			session.SBML = open( os.path.join(request.folder, "static/examples/reactome.sbml") ).read()
			session.flash = "Example SBML loaded."

		importSBML( session.SBML )					# import SBML

		Layouter = request.vars.Layouter				# goto selected Layouter page
		if Layouter == "Ask":
			return redirect( URL(r=request,c='Layout',f='choose')+"?returnto="+URL(r=request,c='Workbench',f='index') )
		if Layouter == "biographer":
			return redirect( URL(r=request,c='Layout',f='biographer')+"?returnto="+URL(r=request,c='Workbench',f='index') )
		if Layouter == "graphviz":
			return redirect( URL(r=request,c='Layout',f='graphviz')+"?returnto="+URL(r=request,c='Workbench',f='index') )
		return redirect( URL(r=request, c='Workbench',f='index') )


#################### BioModels ####################

def BioModels():		# import from BioModels.net

	if (request.env.request_method == "POST") or (request.vars.BioModelsID is not None):	# allows direct calls in the way /biographer/Import/BioModel?BioModelsID=8

		importBioModel( request.vars.BioModelsID )			# import

		if type(request.vars.returnto) == type([]):			# evaluate returnto parameters
			returnto = str(request.vars.returnto[0])
		else:
			returnto = str(request.vars.returnto)
		if (returnto is not None) and (returnto != ""):			# explicit redirection
			return redirect( returnto )

		Layouter = request.vars.Layouter				# implicit redirection: a Layouter was chosen
		if Layouter == "Ask":
			return redirect( URL(r=request,c='Layout',f='choose')+"?returnto="+URL(r=request,c='Workbench',f='index') )
		if Layouter == "biographer":
			return redirect( URL(r=request,c='Layout',f='biographer')+"?returnto="+URL(r=request,c='Workbench',f='index') )
		if Layouter == "graphviz":
			return redirect( URL(r=request,c='Layout',f='graphviz')+"?returnto="+URL(r=request,c='Workbench',f='index') )

		return redirect( URL(r=request, c='Workbench', f='index') )	# else: goto Workbench

	if request.env.request_method == "GET":
		session.PreviousBioModels = db( db.BioModels.Title != None ).select()
		return dict( returnto=request.vars.returnto )


#################### Reactome ####################

def Reactome():									# function: import Reactome
	if request.env.request_method == "GET":
		return dict()

	if request.env.request_method == "POST":
		importReactome( request.vars.ST_ID )				# import Reactome
		return redirect( URL(r=request, c='Workbench', f='index') )

