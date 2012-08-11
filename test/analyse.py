from time import sleep

class TestAnalyse():
  def testSimulate(self):
    self.driver.find_element_by_id('buttonSimulate').click()
    sleep(1)
    
  def testAnalyse(self):
    self.driver.find_element_by_id('buttonAnalyse').click()

