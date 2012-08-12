try:
	import json
except ImportError:
	print "Warning: JSON library not found"

def Iterate():
  '''  
  Controller to perform a single iteration, call the appropriate function
  taking care of JSON import/export;
  Returns string
  '''
	return json.dumps(singleIteration(json.loads(request.vars.state)[0]))
	
def InitialSeed():
  '''  
  Controller to get the Initial Guess Seed;
  Returns string
  '''
	return json.dumps(getInitialSeed())

def AttractorSearch():
  '''  
  Controller to get the state list for a set of initial seeds, then 
  perform an attractor search on the data using the client browser;
  Returns string
  '''
  return json.dumps(getAttractors(json.loads(request.vars.states)))
