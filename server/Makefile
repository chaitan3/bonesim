all: setup

deps: 
	#install web2py and build dependencies
	sudo apt-get install build-essential python-web2py libxml2-dev python-dev checkinstall

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

setup: 
	mkdir -p uploads
