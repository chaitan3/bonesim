from fileio import TestImportExport
from analyse import TestAnalyse
from selenium.webdriver.common.action_chains import ActionChains

class TestNetworkGraph(TestImportExport, TestAnalyse):
  def setUp(self):
    super(TestNetworkGraph, self).setUp()
    self.defaultFile()
    
  def testZoom(self):
    slider = self.driver.find_element_by_css_selector('.ui-slider-handle')
    action = ActionChains(self.driver).click_and_hold(slider).move_by_offset(20, 0) \
      .release()
    action.perform()
    
  def triggerNodeEvent(self, event):
    selector = '#graph0 > g > g:first-child > g:first-child'
    elem = self.driver.find_element_by_css_selector(selector)
    action = ActionChains(self.driver)
    
    if event == 'click':
      action.click(elem)
    elif event == 'right':
      action.context_click(elem)
    else:
      action.move_to_element(elem)
      
    action.perform()
    
  def testNodeClick(self):
    self.triggerNodeEvent('click')
    
  def testEditRule(self):
    self.triggerNodeEvent('right')
    self.driver.find_element_by_id('buttonEdit').click()
  
  def testInfoBox(self):
    self.triggerNodeEvent('hover')
    self.driver.find_element_by_id('boxInfo')
    
  def testTabTransition(self):
    self.driver.find_element_by_css_selector('#tabs > ul > li:nth-child(2)').click()
