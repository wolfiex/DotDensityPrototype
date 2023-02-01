DATASETS="../../Inputs/data/TS*.csv"

all: splash pull 
	@echo ''
	make install -j

splash:
	# stty size | awk '{print $2}'
	# tput cols | awk '{system("cut -c1-"  $2 " splash.txt")}'
	# cut -c1-$(tput cols) splash.txt
	cut -c1-100 splash.txt

pull:
	git pull

push:
	git add -A && git commit -m 'makefile' && git push 

single: 
	python3 pipeline.py

batch:
	for data in ${DATASETS}
	do
	echo "${data}"
	done

pipeline:
	@echo "Creating empty text files..."
	
install:
	@echo "Installing dependancies"
	# sudo pkill -9 apt 
	sudo apt update
	
	# python 
	sudo apt install python3-pip --yes 
	pip install pandas numpy geopandas mercantile p_tqdm halo pyogrio
	pip install protobuf==3.20.*
	pip install git+https://github.com/mapbox/vector-tile-base 

	# if f2py compiler is missing 
	sudo apt-get install gfortran --yes 
	python3 -m numpy.f2py -c tilefunctions.f90 -m customtiles 

	# tippiecanoe
	sudo apt-get install build-essential libsqlite3-dev zlib1g-dev --yes
	mkdir tippecanoe; rm -rf tippecanoe
	git clone https://github.com/mapbox/tippecanoe.git 
	cd tippecanoe && make -j && sudo make install && cd ../ && rm -rf ../tippecanoe

	sudo apt-get install htop --yes
	sudo apt install screen --yes





compute:
	screen -RD compute

kill:
	screen -R -D compute -X quit