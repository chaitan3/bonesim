from fileio import TestImportExport
from analyse import TestAnalyse

class TestNetworkGraph(TestImportExport, TestAnalyse):
  def setUp(self):
    super(TestNetworkGraph, self).setUp()
    self.defaultFile()
    
  def testZoom(self):
    pass
    
  def getRandomNode(self):
    #return self.driver.find_element_by_css_selector('#graph0 > g > g:first-child > g:first-child > text')
    return self.driver.find_element_by_css_selector('#CycD > path')
  
  def testNodeClick(self):
    self.getRandomNode().click()
    
  def testEditRule(self):
    self.getRandomNode().context_click()
    self.driver.find_element_by_id('buttonEdit').click()
  
  def testInfoBox(self):
    pass
    
  def testTabTransition(self):
    self.driver.find_element_by_css_selector('#tabs > ul > li:nth-child(2)').click()
