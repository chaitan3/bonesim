#  add-ui.sh
#  
#  Copyright 2012 Chaitanya <chaitukca@gmail.com>
#  Script to fetch the latest versions of libs required for the simulator
#

#!/bin/sh

#create the lib directory
mkdir -p main/lib

#fetch biographer-ui, install it's compilation dependencies for ubuntu and build it
sudo apt-get install libnode-uglify nodejs
hg clone https://code.google.com/p/biographer.visualization/ UI
if [ ! -e 'UI' ]; then
        echo 'checkout failed'
        exit 1
        fi
cd UI
python src/build/python/manage.py clean build test compress createDistribution
cd ..
cp -R UI/target/distribution/css/. main/css
cp -R UI/target/distribution/js/. main/lib
rm -rf UI

#fetch d3.js min library 
wget http://d3js.org/d3.v2.min.js
mv d3.v2.min.js main/lib

#fetch libSBGN.js, install ant and build it
sudo apt-get install ant
git clone git://github.com/chemhack/libSBGN.js.git
cd libSBGN.js
git submodule init
git submodule update
ant compile
cp build/compiled-advanced.js main/lib/libSBGN.min.js
cd ..
rm -rf libSBGN.js
