# -*- coding: utf-8 -*-

# ... get Reactome
# ... Biomodels

# deactivated for now, since the database-download functions shall be moved to the client

def processedSBML():
  sbml = open(session.sbml)
  text = Graph(SBML = sbml.read()).exportJSON()
  sbml.close()
  return text

def Whi2_boolenet():
  return open('/home/code/biosimulator/Whi2/Whi2.boolenet').read()

