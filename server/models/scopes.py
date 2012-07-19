try:
	exec('import applications.%s.modules.Scopes as Scopes' % request.application)
except ImportError:
	print "Warning: libScopes wrapper not found"

import string, random

def randomFileName():
  size = 10
  chars = string.letters + string.digits
  return ''.join(random.choice(chars) for x in range(size))

def importState(state, nodemap, net):
	present = Scopes.VC(net.numC())
	for i in state.keys():
		present[nodemap[str(i)]] = state[i]
	return present
		
def exportState(present, net):
	nc = net.numC()
	state = dict()
	for i in range(0, nc):
		state[str(net.name(i))] = present[i]
	return state
  
def getInitialSeed():
	net = Scopes.Net()
	nodemap = Scopes.importSBML(net, session.sbml)
	nc = net.numC()
	tgt = Scopes.VC(nc, 1)
	idx = Scopes.VS(nc)
	for i in range(0, nc):
		idx[i] = i
	seed = Scopes.findseed(net, idx, tgt)
	return exportState(seed, net)

def singleIteration(state):
	net = Scopes.Net()
	nodemap = Scopes.importSBML(net, session.sbml)
	nc = net.numC()
	nr = net.numR()
	active = Scopes.VC(nr)
	blocking = Scopes.VC(nr)
	depleted = Scopes.VC(nc)
	present = importState(state, nodemap, net)
	
	if not session.seed:
		seed = present
		session.seed = [i for i in seed]
	else:
		seed = Scopes.VC(nc)
		for i in range(0, nc):
			seed[i] = session.seed[i]
	
	Scopes.dScopeStep(net, present, depleted, active, blocking, seed)
	
	return exportState(present, net)
  
def getAttractors(initStates):
  
  net = Scopes.Net()
  nodemap = Scopes.importSBML(net, session.sbml)
  nc = net.numC()
  nr = net.numR()
  statesList = []
  for i in range(0, len(initStates)):
    ss = Scopes.StateList()
    seed = importState(initStates[i], nodemap, net)
    Scopes.dScopeRun(net, 0, 1000, ss, seed);
    statesList.append([])
    for j in ss:
      statesList[i].append(exportState(j.present, net))
    if ss.cyclic:
      statesList[i].append(statesList[i][-ss.cyclelen])
    else:
      statesList[i].append(statesList[i][-1])  
  return statesList
    
    
  
  
