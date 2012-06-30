#!/bin/sh

hg clone -r python-devel https://code.google.com/p/libscopes/ 
cd libscopes
make python
mkdir -p ../modules
cp build/python/Scopes.py ../modules
cp build/python/_Scopes.so ../modules
touch ../modules/__init__.py
cd ..
rm -rf libscopes

