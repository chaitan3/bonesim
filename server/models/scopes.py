try:
        import Scopes
except ImportError:
        print "Warning: libScopes wrapper not found"

try:
        import json
except ImportError:
        print "Warning: JSON library not found"

def importScopes(sbml_file):
	session.sbml = sbml_file
	session.seed = None

def importStateJSON(state, nodemap, net):
	present = Scopes.VC(net.numC())
	stateDict = json.loads(state)
	for i in stateDict.keys():
		present[nodemap[str(i)]] = stateDict[i]
	return present
		
def exportStateJSON(present, net):
	nc = net.numC()
	state = dict()
	for i in range(0, nc):
		state[str(net.name(i))] = present[i]
	return json.dumps(state)

def singleIteration(state):
	net = Scopes.Net()
	nodemap = Scopes.importSBML(net, session.sbml)
	nc = net.numC()
	nr = net.numR()
	active = Scopes.VC(nr)
	blocking = Scopes.VC(nr)
	depleted = Scopes.VC(nc)
	present = importStateJSON(state, nodemap, net)
	
	if not session.seed:
		seed = present
		session.seed = [i for i in seed]
	else:
		seed = Scopes.VC(nc)
		for i in range(0, nc):
			print i
			seed[i] = session.seed[i]
	
	Scopes.dScopeStep(net, present, depleted, active, blocking, seed)
	
	return exportStateJSON(present, net)
