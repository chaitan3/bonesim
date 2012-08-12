import os
import shutil

def UploadSBML():
  '''  
  Controller for Uploading an SBML file to the server, a random file
  name is generated and the file is saved in the uploads directory;
  '''
  # Get the random file
  while True:
    path = os.path.join(request.folder, 'uploads', randomFileName())
    if not os.path.exists(path):
      break
  
  # Store the name of the file
  session.sbml = path
  session.seed = None
  
  # Copy the contents of the uploaded file to the server's local path
  sbml = open(session.sbml, 'w')
  shutil.copyfileobj(request.vars.file.file, sbml)
  sbml.close()
  
