# -*- coding: utf-8 -*-

# ... get Reactome
# ... Biomodels

# deactivated for now, since the database-download functions shall be moved to the client
import os

def Sample_SBML():
	path_to_file = os.path.join(request.folder, 'static','simulator','demo', 'simpleX0-T-X1.sbml')
	importScopes(path_to_file)
	return Graph(SBML=open(path_to_file).read()).exportJSON()


def Whi2_boolenet():
	return open('/home/code/biosimulator/Whi2/Whi2.boolenet').read()

