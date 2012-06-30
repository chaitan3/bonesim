import os
import shutil

def UploadSBML():
  
  while True:
    path = os.path.join(request.folder, 'uploads', randomFileName())
    if not os.path.exists(path):
      break
  
  session.sbml = path
  session.seed = None
  
  sbml = open(session.sbml, 'w')
  shutil.copyfileobj(request.vars.file.file, sbml)
  sbml.close()
  
