#!/bin/sh

hg clone -r python-devel https://code.google.com/p/libscopes/ 
cd libscopes
make python
cp build/python/Scopes.py ../models/Scopes
cp build/python/_Scopes.so ../models/Scopes
cd ..
rm -rf libscopes

