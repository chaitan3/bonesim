# -*- coding: utf-8 -*-

def index():
	return redirect(URL(r=request, c="Workbench", f="index"))

def internal():
	return redirect(URL(r=request, c="Workbench", f="index"))

def example():									# Ben's example
	return dict()

def graphviz():									# graphviz
	if session.bioGraph is None:
		session.flash = "Unable to visualize: No graph is loaded. Import a model from BioModels.net ?"
		return redirect( URL(r=request, c="Import", f="BioModels")+"?returnto="+URL(r=request, c="Visualization", f="graphviz")+"&BioModelsID=8" )

	VisibleNodes = []

	updateBoxes = ''
	reset = ''

	updateRules = ''
	conditions = []
	shiftRules = ''

	ScenarioFunctions = ''
	ScenarioOptions = ''

	if session.bioGraph.owns('BooleanNetwork'):
		import sbo
		for node in session.bioGraph.Nodes:
			if not node.type == sbo.Compartment:
				VisibleNodes.append(node)

		for node in VisibleNodes:
			reset += "\t\t"+node.id+" = true;\n"
			updateBoxes += "\t\tif ( "+node.id+" )	network.getElementById('"+node.id+"').style.fill = green\n"
			updateBoxes += "\t\telse		network.getElementById('"+node.id+"').style.fill = red;\n"

		# JavaScript update rules
		for line in session.bioGraph.BooleanNetwork.split('\n'):
			if line.strip() != '' and line[0] != '#' and line.find('=') > -1 and line[-5:] not in [' True', '=True', 'False']:
				updateRules += '\t\t'+line.replace(' and ',' && ').replace(' or ',' || ').replace(' not ',' ! ').replace('(not ','(!').replace('*','_new')+';\n'
				node = line.split('=')[0].strip()
				conditions.append('( '+node.replace('*','')+'_new != '+node.replace('*','')+' )')
				OR = True
				shiftRules += '\t\t\t'+node.replace('*','')+' = '+node.replace('*','_new')+';\n'

		# Scenarios
		for i in range(len(session.bioGraph.BooleanNetworkScenarios)):
			Scenario = session.bioGraph.BooleanNetworkScenarios[i]

			ScenarioFunctions += '\tfunction Scenario'+str(i+1)+'() {\n'
			for node in Scenario['statespace'].keys():
				ScenarioFunctions += '\t\t'+node+' = '+str(Scenario['statespace'][node]).lower()+';\n'
			ScenarioFunctions += '\t\tNodeClick(null);\n\t\t}\n\n'

			ScenarioOptions += '\t\t<option value="Scenario'+str(i+1)+'();">'+Scenario['title']+'</option>\n'


	checkSteadyState = ' || '.join(conditions)	# JavaScript's logic or

	NetworkFolder = os.path.join(request.folder, "BooleanNetworks")
	if not os.path.exists(NetworkFolder):
		os.mkdir(NetworkFolder)

	return dict( AvailableNetworks=os.listdir(NetworkFolder), updateBoxes=updateBoxes.rstrip(), reset=reset.rstrip(), updateRules=updateRules.rstrip(), checkSteadyState=checkSteadyState.strip(), shiftRules=shiftRules.rstrip(), ScenarioFunctions=ScenarioFunctions.rstrip(), ScenarioOptions=ScenarioOptions.rstrip() )

