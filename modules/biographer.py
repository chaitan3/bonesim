#!/usr/bin/python
# -*- coding: iso-8859-15 -*-

# biographer library
# by Matthias Bock <matthias.bock@hu-berlin.de>
# Created in the context of Google Summer of Code 2011
# License is GNU GPL Version 2
# Use the biographer web2py environment for execution


### dependencies ###

from math import ceil
import json
import libsbml
import copy
from libimpress import ODP
from libbiopax import BioPAX
import pygraphviz


#### defaults & constants ####

DefaultIndent = 9	# for JSON output string formatting, 9 spaces per indent

MandatoryNodeKeys	= ['id','type','sbo','is_abstract']
NodeKeys		= MandatoryNodeKeys + ['data']
OptionalNodeKeys	= ['clone_marker', 'x', 'y', 'width', 'height', 'radius', 'label', 'compartment', 'subcomponents', 'modifications']
DefaultNode		= { "type":"simple_species", "sbo":"252", "is_abstract":False, "data":{ "clone_marker":-1, "x":10, "y":10, "width":50, "height":20, "radius":30, "label":"Orphan Node", "compartment":-1, "subcomponents":[], "modifications":[] } }

MandatoryEdgeKeys	= ['id','sbo','source','target']
EdgeKeys		= MandatoryEdgeKeys + ['data']
OptionalEdgeKeys	= ['type', 'style', 'thickness', 'label', 'label_x', 'label_y', 'handles']
DefaultEdge		= { "sbo":10, "source":0, "target":0, "data":{ "type":"straight", "style":"solid", "thickness":1, "label":"Orphan Edge", "label_x":10, "label_y":10, "handles":[] } }

# Node types
TYPE = { "entitiy pool node":0, "auxiliary unit":1, "compartment node":2, "container node":3, "process node":4, "reference node":5 }

# Node SBOs
SBO = { "unspecified":0, "compartment":1, "simple chemical":247, "macromolecule":245, "nucleic acid feature":250, "complex":253, "source sink":291, "perturbing agent":405 }

# Edge SBOs
SBO.update({ "consumption":10, "production":11, "modulation":19, "stimulation":459, "catalysis":13, "inhibition":20, "enzymatic catalyst":460, "necessary stimulation":461 })


#### helper functions ####

def checkJSON( JSON ):
	if len(JSON) > 0:
		if JSON.lstrip()[0] != "{":				# JSON needs to start with "{"
			JSON = "{\n"+JSON+"\n}"
		while JSON.count("[") > JSON.count("]"):		# count "[" = count "]"
			JSON += "]"
		while JSON.count("[") < JSON.count("]"):
			JSON = "["+JSON
		while JSON.count("{") > JSON.count("}"):		# count "{" = count "}"
			JSON += "}"
		while JSON.count("{") < JSON.count("}"):
			JSON = "{"+JSON
	else:
		JSON = "{}"
	return JSON


#### main classes ####

### Node ###

class Node:
	def __init__(self, JSON=None, defaults=False):			# input may be string or dictionary
		if defaults:
			self.__dict__.update(copy.deepcopy(DefaultNode))
		if JSON is not None:
			if type(JSON) == type(""):
				JSON = json.loads(JSON)
			self.__dict__.update(copy.deepcopy(JSON))	# map all input key/value pairs to the python object

	def exportJSON(self, Indent=DefaultIndent):			# export Node as JSON string
		return json.dumps( self.__dict__, indent=Indent )

	def exportDICT(self):
		return self.__dict__

	def selfcheck(self):						# perform some basic integrity checks
		result = ""
		show = False

		for key in self.__dict__.keys():			# check if we recognize all keys
			if not key in NodeKeys:
				if key in OptionalNodeKeys:
					result += 'Node key "'+key+'" belongs under "data" !\n'
					self.data[key] = self.__dict__[key]
					del self.__dict__[key]
				else:
					result += 'Warning: Unrecognized Node key "'+key+'" !\n'
					show = True

		for key in MandatoryNodeKeys:				# check mandatory keys
			if not key in self.__dict__:
				result += "Error: "+key+" undefined but mandatory !\n"
				show = True

		if 'data' in self.__dict__.keys():			# check optional keys
			for key in self.data:
				if not key in OptionalNodeKeys:
					result += 'Warning: Unrecognized optional Node key "'+key+'" !\n'
					show = True

		if str(self.id) == "-1":				# check ID
			result += "Error: Node ID -1 is not allowed !\n"
			show = True
		if type(self.id) == type(0):
			if self.id < 0:
				result += "Warning: Node ID < 0 !\n"
				show = True

		if type(self.data['compartment']) == type(0):			# check compartment
			if self.data['compartment'] < 0 and self.type in [0,3]:
				result += "Warning: Node compartment < 0 !\n"
				show = True

									# check visual properties
		if ("width" in self.__dict__.keys()) is not ("height" in self.__dict__.keys()):
			result += "Warning: Incomplete information on Node size !\n"
			show = True

		if show:						# if errors: show source
			result += "Node contains errors: "+self.exportJSON()+"\n"
		return result


### Edge ###

class Edge:
	def __init__(self, JSON=None, defaults=False):			# input parameter may be string or dictionary
		if defaults:
			self.__dict__.update(copy.deepcopy(DefaultEdge))
		if JSON is not None:
			if type(JSON) == type(""):
				JSON = json.loads(JSON)
			self.__dict__.update(copy.deepcopy(JSON))	# import all input key/value pairs to the python object

	def exportJSON(self, Indent=DefaultIndent):
		return json.dumps( self.__dict__, indent=Indent )

	def exportDICT(self):
		return self.__dict__

	def selfcheck(self):
		result = ""
		show = False

		for key in self.__dict__.keys():			# check if we recognize all keys
			if not key in EdgeKeys:
				if key in OptionalEdgeKeys:
					result += 'Edge key "'+key+'" belongs under "data" !\n'
					self.data[key] = self.__dict__[key]
					del self.__dict__[key]
				else:
					result += 'Warning: Unrecognized Edge key "'+key+'" !\n'
					show = True

		for key in MandatoryEdgeKeys:				# check for mandatory keys
			if not key in self.__dict__.keys():
				result += "Error: Mandatory Edge key "+key+" is missing !\n"
				show = True

		if 'data' in self.__dict__.keys():			# check optional keys
			for key in self.data.keys():
				if not key in OptionalEdgeKeys:
					result += 'Warning: Unrecognized optional Edge key "'+key+'" !\n'
					show = True

		if str(self.id) == "-1":				# check ID
			result += "Error: Edge ID -1 is not allowed !\n"
			show = True
		if type(self.id) == type(0):
			if self.id < 0:
				result += "Warning: Edge ID < 0 !\n"
				show = True

									# check label
		if "label" in self.__dict__.keys() and not ("label_x" in self.__dict__.keys() and "label_y" in self.__dict__.keys()):
			result += "Error: Label position missing !\n"
			show = True
		if ("label_x" in self.__dict__.keys()) is not ("label_y" in self.__dict__.keys()):
			result += "Error: Label position incomplete !\n"
			show = True

		if show:						# if errors: show source
			result += "Edge contains errors: "+self.exportJSON()+"\n"
		return result


### Graph ###

class Graph:
	def empty(self):							# reset current model
		self.Nodes = []
		self.Edges = []
		self.maxID = 1
		self.IDmapNodes = self.IDmapEdges = {}
		self.graphviz = None

	def __init__(self, filename=None, JSON=None, SBML=None, ODP=None, BioPAX=None):
		self.empty()
		self.DEBUG = ""
		if filename is not None:
			self.importfile( filename )
		if JSON is not None:
			self.importJSON( JSON )
		if SBML is not None:
			self.importSBML( SBML )
		if ODP is not None:
			self.importODP( ODP )
		if BioPAX is not None:
			self.importBioPAX( BioPAX )

	### handling element IDs ###

	def mapIDs(self):							# generate a map of IDs and array indices
		self.maxID = 1							# thereby determine the highest ID used in our model
		self.IDmapNodes = self.IDmapEdges = {}
		for i in range(0, len(self.Nodes)):
			self.IDmapNodes[ self.Nodes[i].id ] = i
			try:
				if int( self.Nodes[i].id ) > self.maxID:	# may raise an exception, if Node ID is not integer
					self.maxID = int( self.Nodes[i].id )+1
			except:
				pass						# ... this exception is ignored
		for i in range(0, len(self.Edges)):
			self.IDmapEdges[ self.Edges[i].id ] = i
			try:
				if int( self.Edge[i].id ) > self.maxID:
					self.maxID = int( self.Edge[i].id )+1
			except:
				pass						# ... again ignored

	def newID(self):							# generate a valid ID for the creation of a new object into our model
		self.maxID += 1
		return self.maxID


	### functions for Graph creation: import / export ###

	def importfile(self, filename):
		content	= open(filename).read()

		pass	#... detect file type

		self.importJSON( content )

	def importJSON(self, JSON):						# import JSON
		self.empty()
		self.DEBUG = "Importing JSON ...\n"
		JSON = checkJSON(JSON)
		try:
			JSON = json.loads(JSON)
		except:
			self.DEBUG += "Fatal: JSON parser raised an exception!\n"
			return
		self.Nodes = [Node(n, defaults=True) for n in JSON["nodes"]]
		self.Edges = [Edge(e, defaults=True) for e in JSON["edges"]]
		self.mapIDs()
		self.selfcheck()
		self.DEBUG += "Loaded "+str(len(self.Nodes))+" Nodes and "+str(len(self.Edges))+" Edges.\n"

	def exportJSON(self, Indent=DefaultIndent):				# export current model to JSON code
		return json.dumps( { "nodes":[n.exportDICT() for n in self.Nodes], "edges":[e.exportDICT() for e in self.Edges] }, indent=Indent )

	def exportDICT(self):							# export current model as python dictionary
		return self.__dict__

	def importSBML(self, SBML):				# import SBML
		self.empty()

		self.DEBUG = "Importing SBML ...\n"
		SBML = libsbml.readSBMLFromString( SBML )
		model = SBML.getModel()
		if model is None:
			self.DEBUG += "Error: SBML model is None !\n"
			return False

		for compartment in model.getListOfCompartments():
			n = Node( defaults=True )
			n.id			= compartment.getId()
			n.sbo			= SBO["compartment"]
			n.type                  = TYPE["compartment node"]
			n.data["label"]		= compartment.getName()
			if compartment.isSetOutside():
				n.data["compartment"]	= compartment.getOutside()
			self.Nodes.append(n)

		for species in model.getListOfSpecies():
			n = Node( defaults=True )
			n.id			= species.getId()
			n.sbo			= species.getSBOTerm()
			n.type			= TYPE["entitiy pool node"]
			n.data["label"]		= species.getName()
			n.data["compartment"]	= species.getCompartment()
			self.Nodes.append(n)

		self.mapIDs()	# because we will use newID() below

		for reaction in model.getListOfReactions():			# create a process node
			n			= Node( defaults=True )
			n.id			= reaction.getId()
			n.sbo			= SBO["unspecified"]
		        n.type         		= TYPE['process node']
			n.data["label"]		= reaction.getName()
			self.Nodes.append(n)
			self.IDmapNodes[ n.id ]	= len(self.Nodes)-1

			for reactant in reaction.getListOfReactants():		# create Edges from the educts, products and modifiers to this process node
				e		= Edge( defaults=True )
				e.id		= self.newID()
				e.sbo           = SBO['consumption']
				e.source        = reactant.getSpecies()
				e.target	= n.id
				self.Edges.append(e)

			for product in reaction.getListOfProducts():
				e		= Edge( defaults=True )
				e.id		= self.newID()
				e.sbo           = SBO['production']
				e.source        = n.id
				e.target	= product.getSpecies()
				self.Edges.append(e)

			for modifier in reaction.getListOfModifiers():
				e		= Edge( defaults=True )
				e.id		= self.newID()
				e.sbo		= modifier.getSBOTerm()
				e.source        = modifier.getSpecies()
				e.target	= n.id
				self.Edges.append(e)

		self.mapIDs()
		self.selfcheck()
		self.DEBUG += "Loaded "+str(len(self.Nodes))+" Nodes and "+str(len(self.Edges))+" Edges.\n"

	def importODP(self, odp):						# import an OpenOffice Impress Document
		self.DEBUG = "Importing ODP ...\n"
		impress = ODP( odp )
		self.DEBUG += impress.DEBUG
		self.Nodes = impress.Nodes
		self.Edges = impress.Edges
		self.mapIDs()
		self.selfcheck()
		self.DEBUG += "Loaded "+str(len(self.Nodes))+" Nodes and "+str(len(self.Edges))+" Edges.\n"

	def exportODP(self):							# export an OpenOffice Impress Document
		self.DEBUG += "Exporting ODP ...\n"
		impress = ODP()
		impress.Nodes = self.Nodes
		impress.Edges = self.Edges
		return impress.export()

	def importBioPAX(self, biopax):
		self.DEBUG = "Importing BioPAX ...\n"
		b = BioPAX( biopax )
		self.Nodes = b.Nodes
		self.Edges = b.Edges
		self.mapIDs()
		self.selfcheck()
		self.DEBUG += "Loaded "+str(len(self.Nodes))+" Nodes and "+str(len(self.Edges))+" Edges.\n"

	# http://networkx.lanl.gov/pygraphviz/tutorial.html

	def Graphviz(self):
		if self.graphviz is None:
			self.DEBUG += "Exporting Graphviz ...\n"
			self.graphviz = pygraphviz.AGraph(directed=True)
			for node in self.Nodes:
				if (not node.is_abstract) and (self.EdgeCount(node.id) > 0):
					self.graphviz.add_node( str(node.id),
						    label=node.id if "label" not in node.data else node.data["label"],
						    shape='ellipse' if node.type != TYPE["process node"] else 'box' )
			for edge in self.Edges:
				self.graphviz.add_edge( str(edge.source), str(edge.target),
					    arrowhead='normal' if edge.sbo in [ SBO['consumption'], SBO['production'] ] else 'tee' )
		return self.graphviz.string()

	def GraphvizPNG(self, tempfile="/tmp/biographer-graphviz.png"):
		self.DEBUG += "Graphviz -> PNG ...\n"
		self.graphviz.layout( prog='dot' )
		self.graphviz.draw( tempfile )
		return open( tempfile ).read()
		

	### basic functions on Graph properties ###

	def EdgesOfNode(self, nodeID):						# returns an array of Edge IDs, pointing from/to the specified Node
		edges = []
		for e in self.Edges:
			if e.source == nodeID or e.target == nodeID:
				edges.append( e.id )
		return edges

	def NodeCount(self):
		return len(self.Nodes)

	def EdgeCount(self, nodeID=None):
		if nodeID == None:
			return len( self.Edges )
		else:
			return len( self.EdgesOfNode(nodeID) )

	def selfcheck(self, autoresize=True):					# perform some basic integrity checks on the created Graph

		for n in self.Nodes:						# self-check all Nodes and Edges
			self.DEBUG += n.selfcheck()
		for e in self.Edges:
			self.DEBUG += e.selfcheck()

		usedIDs = []		# remember IDs				# check for colliding IDs
		nodeIDs = []		# remember Node IDs
		compartments = [-1]	# remember compartments
		for n in self.Nodes:
			if n.id in usedIDs:
				self.DEBUG += "Error: ID collision: Node "+str(n.id)+"\n"
			else:
				usedIDs.append(n.id)
			if n.type == TYPE["compartment node"]:
				compartments.append(n.id)
			nodeIDs.append(n.id)
		for e in self.Edges:
			if e.id in usedIDs:
				self.DEBUG += "Error: ID collision: Edge "+str(e.id)+"\n"
			else:
				usedIDs.append(e.id)

		for n in self.Nodes:						# Nodes lie inside non-existing compartments ?
			if not n.data['compartment'] in compartments:
				self.DEBUG += "Error: Compartment "+str(n.data['compartment'])+" for Node "+str(n.id)+" does not exist !\n"

		for e in self.Edges:						# Edges connect non-existing Nodes ?
			if not e.source in nodeIDs:
				self.DEBUG += "Error: Source Node "+str(e.source)+" for Edge "+str(e.id)+" does not exist !\n"
			if not e.target in nodeIDs:
				self.DEBUG += "Error: Target Node "+str(e.target)+" for Edge "+str(e.id)+" does not exist !\n"

		for i in range(0, len(self.Nodes)):				# Nodes have non-existing subcomponents ?
			n = self.Nodes[i]					# or subcomponents lie outside parent ?
			changes = False
			for subID in n.data['subcomponents']:
				try:
					s = self.Nodes[ IDmapNodes[subID] ]
					if s.x+s.width > n.x+n.width:
						result += "Warning: Subcomponent "+str(s.id)+" for Node "+str(n.id)+" lies outside it's parent !\n"
						if autoresize:
							n.width = s.x+s.width-n.x
							changes = True
					if s.y+s.height > n.y+n.height:
						result += "Warning: Subcomponent "+str(s.id)+" for Node "+str(n.id)+" lies outside it's parent !\n"
						if autoresize:
							n.height = s.y+s.height-n.y
							changes = True
				except:
					result += "Error: Error checking subcomponent "+str(subID)+" of Node "+str(n.id)+" !\n"
			if changes and autoresize:
				self.Node[i] = n	# save changes


	### functions for really doing something with the Graph ###

	def CloneNode(self, nodeID, ConnectedEdges=None, NumClones=1):			# split Node into 1x original + 1x clone
		self.DEBUG += "Splitting Node "+str(nodeID)+" ...\n"
		try:
			original = self.Nodes[ IDmapNodes[nodeID] ]
		except:
			self.DEBUG += "Fatal: Failed to map ID to array index!\n"
			return

		# clone the thing ...	#

		clone = []
		for i in range(0, NumClones):
			clone.append( original )
			clone[i].id = self.newID()
			clone[i].data["clone_marker"] = original.id

		######################################################################
		# an error will occur, if a Node is cloned, that is already abstract
		# reaction Nodes cannot be cloned !
		######################################################################

		original.is_abstract = True
		self.DEBUG += str(NumClones)+" clone(s) created. Original Node is now abstract (invisible).\n"
	
		# re-distribute Edges connected to the original Node onto clone Nodes #

		if ConnectedEdges is None:						# if function is called from splitNodeOfDegree, avoid double work
			ConnectedEdges = self.EdgesOfNode( original.id )

		if len(ConnectedEdges) > 0:
			CurrentClone = 0
			EdgesPerClone = ceil( len(ConnectedEdges) / float(NumClones) )	# must be ceiled, because ALL Edges need to be distributed
			EdgesOfCurrentClone = 0
			for eID in ConnectedEdges:
				if self.Edge[ IDmapEdges[eID] ].source == original.id:
					self.Edge[ IDmapEdges[eID] ].source = clone[CurrentClone].id
					self.DEBUG += "Edge "+str( e.ID )+" now originates from cloned Node "+str( clone[CurrentClone].id )+".\n"
					EdgesOfCurrentClone += 1
				elif self.Edge[ IDmapEdges[eID] ].target == original.id:
					self.Edge[ IDmapEdges[eID] ].target = clone[CurrentClone].id
					self.DEBUG += "Edge "+str( e.ID )+" now points to cloned Node "+str( clone[CurrentClone].id )+".\n"
					EdgesOfCurrentClone += 1
				else:
					self.DEBUG += "Warning: Edge "+str(eID)+" is listed as connected to Node "+str(original.id)+", but that's not true!\n"

				# Above code demands: An Edge cannot originate from it's target !

				if EdgesOfCurrentClone >= EdgesPerClone:
					CurrentClone += 1

		# save changes #

		self.Nodes[ IDmapNodes[nodeID] ] = original				# save changes to the original Node
		for i in range(0, NumClones):						# append clones to Node array
			self.Nodes.append( clone[i] )
			self.IDmapNodes[ clone[i].id ] = len(self.Nodes)-1		# update ID index
			self.IDmap[ clone[i].id ] = self.IDmapNodes[ clone[i].id ]

		self.DEBUG += "Node "+str(nodeID)+" cloned to 1 abstract Node + "+str(NumClones)+" clone Node(s). "+str( len(ConnectedEdges) )+" Edge(s) re-distributed.\n"
			

	def setMaxEdges(self, degree):							# split all Nodes, that have more than "degree" Edges connected
		self.MaxEdges = degree
		self.DEBUG += "Maximum Edge count set to "+str(degree)+".\n"
		for ID in self.IDmapNodes.keys():					# for all Nodes
			edges = self.EdgesOfNode( ID )					# get the connected Edges,
			if len(edges) > degree:						# count them, and if they are too many ...
				self.DEBUG += "Node "+str( ID )+" exceeds maximum edge count: "+str( len(edges) )+" edges.\n"
				self.CloneNode( ID, ConnectedEdges=edges )		# ... clone the Node


