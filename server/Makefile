all: setup

libs: libscopes libsbml

deps: 
	#install web2py and build dependencies
	sudo apt-get install build-essential web2py libxml2-dev python-dev checkinstall

libscopes: 
	#clone the libscopes repo and compile the python module
	hg clone -r python-devel https://code.google.com/p/libscopes/ 
	cd libscopes; \
	make python
	mkdir -p modules
	cp libscopes/build/python/Scopes.py modules
	cp libscopes/build/python/_Scopes.so modules
	touch modules/__init__.py
	rm -rf libscopes

libsbml:
	#fetch the source and build the python module, use checkinstall
	wget "http://downloads.sourceforge.net/project/sbml/libsbml/4.3.1/libSBML-4.3.1-src.tar.gz?r=&ts=1314024612&use_mirror=freefr" -O libSBML-4.3.1-src.tar.gz
	tar -xzf libSBML-*-src.tar.gz
	cd libsbml-*; \
	./configure --with-python; \
	make; \
	sudo checkinstall
	
setup: 
	mkdir -p uploads
