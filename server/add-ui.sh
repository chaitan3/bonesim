#!/bin/bash

# remove old installation
cd static
rm Visualization -fR
rm biographer.visualization -fR

# download
hg clone --rev ce0138fb634d https://code.google.com/p/biographer.visualization/ UI
if [ ! -e 'UI' ]; then
	echo 'checkout failed'
	exit 1
	fi
cd UI
rm .hg* -fR

# resolve dependencies
sudo apt-get update; apt-get install libnode-uglify nodejs node --yes

# build
python src/build/python/manage.py clean build test jslint jsdoc compress createDistribution

# link
cd ..
ln UI/target/distribution Visualization -s

