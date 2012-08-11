import os
from simulator import TestSimulator

class TestImportExport(TestSimulator):
  testFiles = {}
  testFiles['formatSBML'] = 'simpleX0-T-X1.sbml'
  testFiles['formatRBoolNet'] = 'mammal.r'
  testFiles['formatGINML'] = 'boolean_cell_cycle.ginml'
  testFiles['formatPyBooleanNet'] = 'Whi2.boolenet'
  
  def importFile(self, fileType, seed = 'seedTrue'):
    self.driver.find_element_by_id('buttonImportDialog').click()
    self.driver.find_element_by_id('fileNetwork').send_keys(os.path.join(os.getcwd(), \
      'demo', self.testFiles[fileType]))
    self.driver.find_element_by_id(seed).click()
    self.driver.find_element_by_id(fileType).click()
    self.driver.find_element_by_id('buttonImportFile').click()
    self.checkJSError()
  
  def testR(self):
    self.importFile('formatRBoolNet')
    
  def testPython(self):
    self.importFile('formatPyBooleanNet')
    
  def testGINML(self):
    self.importFile('formatGINML')
  
  def defaultFile(self):
    self.testR()
      
  
  def exportFile(self, click):
    self.defaultFile()
    self.driver.find_element_by_id('buttonExportDialog').click()
    for i in click:
      self.driver.find_element_by_id(i).click()
    self.driver.find_element_by_id('buttonExportFile').click()
    
  def exportFileNetworkSVG(self):
    self.exportFile(['exportNetwork', 'graphSVG'])
    
  def exportFileNetworkjSBGN(self):
    self.exportFile(['exportNetwork', 'graphjSBGN'])
    
  def exportFileNetworkSBGN(self):
    self.exportFile(['exportNetwork', 'graphSBGN'])
    
  def exportFileRBoolNet(self):
    self.exportFile(['exportNetworkRBoolNet'])

  def exportFilePythonBooleanNet(self):
    self.exportFile(['exportNetworkPyBooleanNet'])
    
