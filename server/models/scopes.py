import sys,os
sys.path.append(os.path.join(request.folder, 'static','simulator','Scopes'))
try:
	import Scopes
except ImportError:
	print "Warning: libScopes not found"
try:
	import json
except ImportError:
	print "Warning: JSON library not found"

def importScopes(sbml_file):
	#net = Scopes.Net()
	#nodemap = Scopes.importSBML(net, sbml_file)
	#session.net = net
	#session.nodemap = nodemap
	session.sbml = sbml_file

def importStateJSON(state, present, nodemap):
	stateDict = json.loads(state)
	#nodemap = session.nodemap
	for i in stateDict.keys():
		print i
		present.put(nodemap[str(i)], stateDict[i])
		
def exportStateJSON(present, net):
	#net = session.net	
	nc = net.numC()
	state = dict()
	for i in range(0, nc):
		state[str(net.name(i))] = present.at(i)
	return json.dumps(state)

def singleIteration(state):
	print session.sbml
	#net = session.net
	net = Scopes.Net()
	nodemap = Scopes.importSBML(net, session.sbml)
	nc = net.numC()
	nr = net.numR()
	active = Scopes.VC(nr)
	blocking = Scopes.VC(nr)
	present = Scopes.VC(nc)
	depleted = Scopes.VC(nc)
	importStateJSON(state, present, nodemap)
	
	Scopes.dScopeStep(net, present, depleted, active, blocking)
	
	return exportStateJSON(present, net)
