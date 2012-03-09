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
	import sbo
	for node in session.bioGraph.Nodes:
		if not node.type == sbo.Compartment:
			VisibleNodes.append(node)

	updateBoxes = ''
	reset = ''
	for node in VisibleNodes:
		reset += "\t\t"+node.id+" = true;\n"
		updateBoxes += "\t\tif ( "+node.id+" )	network.getElementById('"+node.id+"').style.fill = green\n"
		updateBoxes += "\t\telse		network.getElementById('"+node.id+"').style.fill = red;\n"

	updateRules = ''
	checkSteadyState = ''
	OR = False
	shiftRules = ''
	if session.bioGraph.owns('BooleanNetwork'):
		for line in session.bioGraph.BooleanNetwork.split('\n'):
			if line.strip() != '' and line[0] != '#' and line.find('=') > -1 and line[-5:] not in [' True', '=True', 'False']:
				updateRules += '\t\t'+line.replace(' and ',' && ').replace(' or ',' || ').replace(' not ',' ! ').replace('(not ','(!').replace('*','_new')+';\n'
				node = line.split('=')[0].strip()
				if OR:
					checkSteadyState += ' || '
				checkSteadyState += '( '+node.replace('*','')+' != '+node.replace('*','')+'_new )'
				OR = True
				shiftRules += '\t\t\t'+node.replace('*','')+' = '+node.replace('*','_new')+';\n'

	Scenarios = ''

	return dict( updateBoxes=updateBoxes.rstrip(), reset=reset.rstrip(), updateRules=updateRules.rstrip(), checkSteadyState=checkSteadyState.strip(), shiftRules=shiftRules.rstrip(), Scenarios=Scenarios.rstrip() )

