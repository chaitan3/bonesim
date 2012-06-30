try:
	exec('import applications.%s.modules.Scopes as Scopes' % request.application)
except ImportError:
	print "Warning: libScopes wrapper not found"

try:
	import json
except ImportError:
	print "Warning: JSON library not found"

import string, random

def randomFileName():
  size = 10
  chars = string.letters + string.digits
  return ''.join(random.choice(chars) for x in range(size))

def getInitialSeed():
	net = Scopes.Net()
	nodemap = Scopes.importSBML(net, session.sbml)
	nc = net.numC()
	tgt = Scopes.VC(nc, 1)
	idx = Scopes.VS(nc)
	for i in range(0, nc):
		idx[i] = i
	seed = Scopes.findseed(net, idx, tgt)
	return exportStateJSON(seed, net)

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
			seed[i] = session.seed[i]
	
	Scopes.dScopeStep(net, present, depleted, active, blocking, seed)
	
	return exportStateJSON(present, net)
