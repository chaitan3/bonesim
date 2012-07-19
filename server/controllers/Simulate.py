try:
	import json
except ImportError:
	print "Warning: JSON library not found"

def Iterate():
	return json.dumps(singleIteration(json.loads(request.vars.state)[0]))
	
def InitialSeed():
	return json.dumps(getInitialSeed())

def AttractorSearch():
  return json.dumps(getAttractors(json.loads(request.vars.states)))
