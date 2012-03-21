# -*- coding: utf-8 -*-

def index():
	if session.bioGraph is None:
		session.flash = "Unable to visualize: No graph is loaded. Import a model from BioModels.net ?"
		return redirect( URL(r=request, c="Import", f="BioModels")+"?returnto="+URL(r=request, c="UI", f="index")+"&BioModelsID=8" )

	VisibleNodes = []

	onClickListeners = ''

	updateRules = {}

	ScenarioFunctions = ''
	ScenarioOptions = ''

	if session.bioGraph.owns('BooleanNetwork'):
		import sbo, re
		for node in session.bioGraph.Nodes:
			if not node.type == sbo.Compartment:
				VisibleNodes.append(node)

		# JavaScript update rules
		for line in session.bioGraph.BooleanNetwork.split('\n'):
			if line.strip() != '' and line[0] != '#' and line.find('=') > -1 and line[-5:] not in [' True', '=True', 'False']:
				s = line.replace('*','=').split('=')
				left = s[0].strip()
				JavaScript = ''.join(s[1:]).replace(' and ',' && ').replace(' or ',' || ').replace(' not ',' ! ').replace('(not ','(!').replace('*','_new').replace('\t','')
				
				for node in re.split('\W+', JavaScript):
					if node != '':
						regex = re.compile('\\b'+node+'\\b')
						JavaScript = regex.sub('Statespace["'+node+'"]', JavaScript)
				updateRules[left] = JavaScript.strip()

		# Scenarios
		for i in range(len(session.bioGraph.BooleanNetworkScenarios)):
			Scenario = session.bioGraph.BooleanNetworkScenarios[i]

			ScenarioFunctions += '\tfunction Scenario'+str(i+1)+'() {\n'
			for node in Scenario['statespace'].keys():
				ScenarioFunctions += '\t\tStatespace["'+node+'"] = '+str(Scenario['statespace'][node]).lower()+';\n'
			ScenarioFunctions += '\t\tRefreshGraph();\n\t\t}\n\n'

			ScenarioOptions += '\t\t<option value="Scenario'+str(i+1)+'();">'+Scenario['title']+'</option>\n'

	return dict( Nodes=',\n'.join("\t\t'"+node.id+"'" for node in session.bioGraph.Nodes).strip(), updateRules=',\n'.join(["\t\t'"+key+"':'"+updateRules[key]+"'" for key in updateRules.keys()]).strip(), ScenarioFunctions=ScenarioFunctions.rstrip(), ScenarioOptions=ScenarioOptions.rstrip() )

