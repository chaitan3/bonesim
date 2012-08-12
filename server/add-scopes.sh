#!/bin/sh

#clone the libscopes repo
hg clone -r python-devel https://code.google.com/p/libscopes/ 
cd libscopes
#compile the python module
make python
mkdir -p ../modules
#copy the Scopes module to the modules directory
cp build/python/Scopes.py ../modules
cp build/python/_Scopes.so ../modules
touch ../modules/__init__.py
cd ..
rm -rf libscopes

