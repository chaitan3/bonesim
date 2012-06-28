#!/bin/sh
sudo apt-get install libnode-uglify nodejs
hg clone https://code.google.com/p/biographer.visualization/ UI
if [ ! -e 'UI' ]; then
        echo 'checkout failed'
        exit 1
        fi
cd UI
python src/build/python/manage.py clean build test jslint jsdoc compress createDistribution
cd ..
cp -R UI/target/distribution bui
rm -rf UI
