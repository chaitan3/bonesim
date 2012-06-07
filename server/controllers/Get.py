# -*- coding: utf-8 -*-

# ... get Reactome
# ... Biomodels

# deactivated for now, since the database-download functions shall be moved to the client
import os

def Whi2p_boolenet():
	path_to_file = os.path.join(request.folder, 'static','simulator','Whi2','Whi2.boolenet')
	return open(path_to_file).read()

def Mammal_RBoolNet():
	path_to_file = os.path.join(request.folder, 'static','simulator','mammal.txt')
	return open(path_to_file).read()

def Whi2_boolenet():
	return open('/home/code/biosimulator/Whi2/Whi2.boolenet').read()

