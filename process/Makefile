all: pull 
	make install -j

say_hello:
	@echo "Hello World"

pull:
	git pull

push:
	git add -A && git commit -m 'makefile' && git push 

generate:
	@echo "Creating empty text files..."
	
install:
	@echo "Installing dependancies"
	# sudo pkill -9 apt 
	# python 
	sudo apt install python3-pip --yes 
	pip install pandas numpy geopandas mercantile p_tqdm
	pip install protobuf==3.20.*
	pip install git+https://github.com/mapbox/vector-tile-base 

	# if f2py compiler is missing 
	sudo apt-get install gfortran --yes 
	python3 -m numpy.f2py -c tilefunctions.f90 -m customtiles 

	# tippiecanoe

	git clone https://github.com/mapbox/tippecanoe.git 
	cd tippecanoe
	make -j
	make install
	rm -rf tippecanoe

	sudo apt-get install htop --yes