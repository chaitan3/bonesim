from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import os, sys
import unittest

testFiles = {}
testFiles['formatSBML'] = 'simpleX0-T-X1.sbml'
testFiles['formatRBoolNet'] = 'mammal.r'
testFiles['formatGINML'] = 'boolean_cell_cycle.ginml'
testFiles['formatPyBooleanNet'] = 'Whi2.boolenet'

def testFile(driver, fileType, seed='seedTrue'):
  global testFiles
  driver.find_element_by_id('buttonImportDialog').click()
  driver.find_element_by_id('fileNetwork').send_keys(os.path.join(os.getcwd(), \
    'demo', testFiles[fileType]))
  driver.find_element_by_id(seed).click()
  driver.find_element_by_id(fileType).click()
  driver.find_element_by_id('buttonImportFile').click()
  
class TestSimulator(unittest.TestCase):
  def setUp(self):
    url = 'http://127.0.0.1:8000/biographer/static/simulator/index.html'
    self.driver = webdriver.Chrome()
    self.driver.get(url)
  def tearDown(self):
    try:
      os.remove('chromedriver.log')
    except:
      pass
    #~ self.driver.close()

class TestR(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatRBoolNet')

class TestPython(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatPyBooleanNet')

class TestGINML(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatGINML')
    
class TestSimulate(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatRBoolNet')
    self.driver.find_element_by_id('buttonSimulate').click()
    
class TestAnalyze(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatRBoolNet')
    self.driver.find_element_by_id('buttonAnalyse').click()    

class TestSBML(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatSBML')

class TestSBMLSeed(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatSBML', seed='seedGuess')
  
class TestSBMLSimulate(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatSBML')
    self.driver.find_element_by_id('buttonSimulate').click()
    
class TestSBMLAnalyze(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatSBML')
    self.driver.find_element_by_id('buttonAnalyse').click()
    
class TestExportRBoolNet(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatPyBooleanNet')
    self.driver.find_element_by_id('buttonExportDialog').click()
    self.driver.find_element_by_id('exportNetworkRBoolNet').click()
    self.driver.find_element_by_id('buttonExportFile').click()

class TestExportPythonBooleanNet(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'formatPyBooleanNet')
    self.driver.find_element_by_id('buttonExportDialog').click()
    self.driver.find_element_by_id('exportNetworkPyBooleanNet').click()
    self.driver.find_element_by_id('buttonExportFile').click()
    
    
