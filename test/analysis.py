from time import sleep
from graph import TestGraph

class TestAnalysis(TestGraph):
  def testAnalysisSimulate(self):
    self.driver.find_element_by_id('buttonSimulate').click()
    sleep(1)
    
  def testAnalysisAnalyse(self):
    self.driver.find_element_by_id('buttonAnalyse').click()
    self.checkJSError()
    
  def testAnalysisPlot(self):
    self.testAnalysisSimulate()
    self.driver.find_element_by_css_selector('#tabs > ul > li:nth-child(3)').click()
    self.driver.find_element_by_css_selector('#legendNodes > ul :nth-child(2) > span ').click();

class TestStateTransition(TestAnalysis):
  def setUp(self):
    super(TestStateTransition, self).setUp()
    self.graph = 'transition'
    self.testAnalysisAnalyse()
