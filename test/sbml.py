from fileio import TestImportExport
from analyse import TestAnalyse

class TestSBML(TestImportExport, TestAnalyse):  
  
  def testSBML(self):
    self.importFile('formatSBML')
  
  def testSBMLGuessSeed(self):
    self.importFile('formatSBML', seed='seedGuess')
    
  def testSBMLSimulate(self):
    self.testSBML()
    self.testSimulate()
  
  def testSBMLAnalyse(self):
    self.testSBML()
    self.testAnalyse()
