try:
	exec('import applications.%s.modules.Scopes as Scopes' % request.application)
except ImportError:
	print "Warning: libScopes wrapper not found"

import string, random

def randomFileName():
  ''' 
  Generate a random file name, used for storing the sbml files; 
  Returns a string 
  '''
  size = 10
  chars = string.letters + string.digits
  return ''.join(random.choice(chars) for x in range(size))

def importState(state, nodemap, net):
  ''' 
  Import the state of the network from the JSON object(dict); 
  Returns Scopes object 
  '''
  # Create the Scopes object to store the state of the network
  present = Scopes.VC(net.numC())
  for i in state.keys():
    # Map the node id to a number used internally by libScopes using nodemap
    present[nodemap[str(i)]] = state[i]
  return present
		
def exportState(present, net):
  ''' 
  Export the state of the network to a JSON object;
  Returns dict
  '''
  # Get the number of compounds in the network
  nc = net.numC()
  state = dict()
  for i in range(0, nc):
    # Get the id of a node using the name method
    state[str(net.name(i))] = present[i]
  return state
  
def getInitialSeed():
  ''' 
  Get the initial Guess Seed for the network; 
  Returns dict 
  '''
  net = Scopes.Net()
  # Import the network from the file
  # The filename is stored in a session variable of web2py
  nodemap = Scopes.importSBML(net, session.sbml)
  nc = net.numC()
  # Get target Scopes object
  tgt = Scopes.VC(nc, 1)
  idx = Scopes.VS(nc)
  # Initial Guess Seed
  for i in range(0, nc):
    idx[i] = i
  seed = Scopes.findseed(net, idx, tgt)
  return exportState(seed, net)

def singleIteration(state):
  ''' 
  Perform a single iteration on the network;
  Returns dict 
  '''
  net = Scopes.Net()
  nodemap = Scopes.importSBML(net, session.sbml)
  nc = net.numC()
  nr = net.numR()
  # Default Scopes objects
  active = Scopes.VC(nr)
  blocking = Scopes.VC(nr)
  depleted = Scopes.VC(nc)
  # Import the current state of the network into present
  present = importState(state, nodemap, net)

  # Check if this is the first Iteration
  if not session.seed:
    # Copy seed given to the network into the session's seed variable
    seed = present
    session.seed = [i for i in seed]
  else:
    # Apply the seed given initially to the network
    seed = Scopes.VC(nc)
    for i in range(0, nc):
      seed[i] = session.seed[i]

  # Perform a single iteration using libScopes
  Scopes.dScopeStep(net, present, depleted, active, blocking, seed)

  return exportState(present, net)
  
def getAttractors(initStates):
  ''' 
  Perform a continuous simulation on the network using a set 
  of initial states;
  Returns list  
  '''
  net = Scopes.Net()
  nodemap = Scopes.importSBML(net, session.sbml)
  nc = net.numC()
  nr = net.numR()
  statesList = []
  # For each initial state perform a simulation
  for i in range(0, len(initStates)):
    # Extract the seed
    ss = Scopes.StateList()
    seed = importState(initStates[i], nodemap, net)
    # Perform the simulation till a cyclic/steady state is reached
    Scopes.dScopeRun(net, 0, 1000, ss, seed);
    # Copy the result to a state list
    statesList.append([])
    for j in ss:
      statesList[i].append(exportState(j.present, net))
    if ss.cyclic:
      statesList[i].append(statesList[i][-ss.cyclelen])
    else:
      statesList[i].append(statesList[i][-1])  
  return statesList
    
    
  
  
