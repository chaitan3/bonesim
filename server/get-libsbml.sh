#!/bin/bash

sudo apt-get update; apt-get install -y wget tar make gcc libxml2-dev python-dev

wget "http://downloads.sourceforge.net/project/sbml/libsbml/4.3.1/libSBML-4.3.1-src.tar.gz?r=&ts=1314024612&use_mirror=freefr" -O libSBML-4.3.1-src.tar.gz

echo "Unpacking ..."
tar -xzf libSBML-4.3.1-src.tar.gz
cd libsbml-4.3.1
./configure --with-python
make
make install
ldconfig
