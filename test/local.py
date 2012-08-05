from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import os, sys
import unittest

testFiles = {}
testFiles['sbml'] = 'simpleX0-T-X1.sbml'
testFiles['r'] = 'mammal.r'
testFiles['ginml'] = 'boolean_cell_cycle.ginml'
testFiles['python'] = 'Whi2.boolenet'

def testFile(driver, fileType, seed='allTrue'):
  global testFiles
  driver.find_element_by_id('importButton').click()
  driver.find_element_by_id('file').send_keys(os.path.join(os.getcwd(), \
    'demo', testFiles[fileType]))
  driver.find_element_by_id(seed).click()
  driver.find_element_by_id(fileType).click()
  driver.find_element_by_id('importFile').click()
  
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
    testFile(self.driver, 'r')

class TestPython(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'python')

class TestGINML(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'ginml')
    
class TestSimulate(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'r')
    self.driver.find_element_by_id('simulation').click()
    
class TestAnalyze(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'r')
    self.driver.find_element_by_id('analyze').click()    

class TestSBML(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'sbml')

class TestSBMLSeed(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'sbml', seed='guessSeed')
  
class TestSBMLSimulate(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'sbml')
    self.driver.find_element_by_id('simulation').click()
    
class TestSBMLAnalyze(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'sbml')
    self.driver.find_element_by_id('analyze').click()
    
class TestExportRBoolNet(TestSimulator):
  def runTest(self):
    testFile(self.driver, 'python')
    self.driver.find_element_by_id('exportButton').click()
    self.driver.find_element_by_id('rbn').click()
    self.driver.find_element_by_id('exportFile').click()
    
    
