from selenium import webdriver
import unittest, os

class TestSimulator(unittest.TestCase):
  def checkJSError(self):
    self.assertIsNone(self.driver.find_element_by_tag_name('body').get_attribute('JSError'))

  def setUp(self):
    url = 'http://127.0.0.1:8000/biographer'
    self.driver = webdriver.Chrome()
    self.driver.get(url)
    self.checkJSError()
  
  def tearDown(self):
    self.checkJSError()
    try:
      os.remove('chromedriver.log')
    except:
      pass
    self.driver.quit()
  
  def testUI(self):
    pass
    
    
