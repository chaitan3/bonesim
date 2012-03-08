#!/bin/bash

# resolve dependencies
sudo apt-get update; apt-get install wget unzip python-simplejson --yes

wget http://www.web2py.com/examples/static/web2py_src.zip
unzip web2py_src.zip

