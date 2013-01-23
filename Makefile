#  Makefile
#  
#  Copyright 2012 Chaitanya Talnikar <chaitukca@gmail.com>
#  
#  This file contains the necessary targets for building the simulator 
#  for production.

SRC = main
JSFILES = $(SRC)/js/*
HTML = $(SRC)/index.html
LIB = $(SRC)/lib
CSS = $(SRC)/css
ZIP = simulator
TEST = test.io.TestImportExport.testR
LINT = jshint

all: lint doc test pkg

libs: libdir bui d3 libSBGN.js

libdir: 
	#create the lib directory
	rm -rf $(LIB)
	mkdir -p $(LIB)

bui:
	#fetch biographer-ui, install it's compilation dependencies for ubuntu and build it
	hg clone https://chaitukca@code.google.com/p/biographer/
	cd biographer/bui; \
	python src/build/python/manage.py clean build test compress createDistribution
	cp -R biographer/bui/target/distribution/css/. $(CSS)
	cp -R biographer/bui/target/distribution/js/. $(LIB)
	rm -rf biographer
 
d3:
	#fetch d3.js min library 
	wget http://d3js.org/d3.v3.min.js
	mv d3.v3.min.js $(LIB)

libSBGN.js: 
	#fetch libSBGN.js, install ant and build it
	git clone git://github.com/chemhack/libSBGN.js.git
	cd libSBGN.js; \
	git submodule init; \
	git submodule update; \
	ant compile
	cp libSBGN.js/build/compiled-advanced.js $(LIB)/libSBGN.min.js 
	rm -rf libSBGN.js

lint: 
	#run lint to check code faults
	$(LINT) $(JSFILES)
	
doc: 
	#create documentation for the project
	rm -rf jsdoc
	jsdoc -d=jsdoc $(JSFILES)
	
deps: 
	#dependencies required for the simulator: building libs, checking code
	sudo apt-get install nodejs npm node-uglify  ant git-core \
		jsdoc-toolkit libqtwebkit4 python-qt4 python-pip
	sudo npm install -g $(LINT)
	sudo pip install selenium
	
browse:
	#test the app in a small browser
	python tests/browse.py $(HTML)
	
test: 
	#test using selenium webdriver locally
	python tests/main.py
	
pkg:
	#create a deployable package
	cd main; \
	zip -r $(ZIP) .
	mv main/$(ZIP).zip .

