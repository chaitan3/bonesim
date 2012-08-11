import unittest
from network import TestNetworkGraph
from sbml import TestSBML

def main():
  loader = unittest.TestLoader()
  graph = loader.loadTestsFromTestCase(TestNetworkGraph)
  
  loader.testMethodPrefix = 'testSBML'
  sb = loader.loadTestsFromTestCase(TestSBML)
  
  allTests = unittest.TestSuite([sb, graph])
  
  unittest.TextTestRunner(verbosity = 2).run(allTests)

if __name__ == "__main__":
  main()
