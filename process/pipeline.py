'''
Dependancies: 
    pip install pandas numpy geopandas mercantile p_tqdm vector_tile_base

Purpose: 
    A processing script for OA level census data to dot-density    

Author: Daniel Elis 
'''

# import multiprocess.context as ctx
# ctx._force_start_method('spawn')
from multiprocessing import cpu_count
from p_tqdm import p_uimap,p_umap
from functools import partial
sys.setrecursionlimit(2500)

import os, sys, glob

import numpy as np
import pandas as pd
import geopandas as gpd
import mercantile, vector_tile_base


#  this uses / compiles the fortran libraries. If the code falls over here delete the .so files and rerun. 
try:
    from customtiles import * 
except:    
    os.popen('f2py -c tilefunctions.f90 -m customtiles').read()
    from customtiles import * 


'''
Constants for processing 
'''

EXTENT = 4096
HALF_EXTENT = EXTENT/2 
HALF_BUFFER = 2./14. * HALF_EXTENT
NCPUS = cpu_count()

DLOC = '/Users/danielellis/ONSVis/DotDensityTiles/processing/2021-oa-data/'' # data location
GEOMLOC = '/Users/danielellis/ONSVis/DotDensityTiles/processing/geom.shp'
OUTPUTLOC = '/Users/danielellis/ONSVis/'





if __name__ == '__main__':

    #############################
    # DatasetSelection UI
    #############################
    typen = glob.glob(DLOC+'/TS*.csv')
    for i in enumerate(typen):
        print(i)

    typen = typen[int(input('Select Value: '))]

    typen = typen.split('/')[-1].split('.')[0]
    print(typen)
    os.system('date')




    '''
    The full generation cycle for a single dataset is given below. 
    '''
    # output location 
    oloc = OUTPUTLOC+typen
    os.system(f'mkdir {oloc}')

    ''' Lets  load all relevant data '''

    geom = gpd.read_file(GEOMLOC).set_index('OA21CD')
    geom = geom.geometry

    data = pd.read_csv(DLOC+typen+'.csv').set_index('Geography code')


    # automatically select the sections with data in them. 
    start = list(data.columns).index('Classification') + 1
    end = list(data.columns).index('Total')
    selection = list(data.columns)[start:end]
    data = data[selection]

    # combine the 
    oas = list(set(data.index) & set(geom.index))
    np.random.shuffle(oas)



    #############################
    #  Funciton to generate the points. 
    #############################


    def makepoints(area_chunks,groupby = 15):
        '''This functions processes the points for several areas'''
        dummy = []

        for area in area_chunks:
            row = data.loc[area]
            for cid,col in enumerate(selection):
                    # for each category
                    polygon = geom.loc[area]
                    ptcds = [i[0] for i in polygon.centroid.xy]
                    # convert geometry into a list of coordinates
                    try: poly = np.array(polygon.exterior.coords.xy).tolist()
                    except AttributeError:
                        poly = np.array(polygon.geoms[0].exterior.coords.xy).tolist()
                    points = []

                    counter = 0
                    nvar = int(row[col])
                    nstop= int(nvar*1.5) #  max range as to avoid infinte loops
                    minx, miny, maxx, maxy = polygon.bounds

                    for coords in np.array([np.random.uniform(minx, maxx, nstop), np.random.uniform(miny, maxy, nstop)]).T:
                        

                        # CHANGED TO LIST
                        coords = list(coords)


                        if len(coords) and point_in_polygon(*coords,*poly): 
                            points.append(coords)
                            counter += 1
                            if counter >= nvar:
                                break
                    
                            # each time we get a len of "groupby" points, write to array 
                            if len(points)>groupby:
                                dummy.append([cid,points,*ptcds])
                                points = []

                    # write any leftover points 
                    if len(points):
                        dummy.append([cid,points,*ptcds])

        #  shuffle the points to induce randomness. 
        np.random.shuffle(dummy)
        return dummy


    #############################
    #  Actually generate these points in 'll
    #############################


    try:
        gdf = pd.read_pickle(f'{oloc}/points.pkl')
    except:

        split = np.array_split(oas,NCPUS)#80
        print(len(split[0]))

        res = []
        iterator = p_uimap(makepoints,split)
        for l in iterator:
            res.extend(l)

        gdf = pd.DataFrame(np.array(res,dtype=object))
        gdf.columns = 'cat point x y'.split()
        gdf = gdf.sort_values('x y'.split())



        
        
        gdf.reset_index().to_pickle(f'{oloc}/points.pkl')
        os.system(f'echo "*.pkl" >> {oloc}/.gitignore')
        print(f'saved {typen} pkl')

        
    # gdf = gdf[gdf.point != []]
    print(gdf)




    def gunwale_bobbing(schema,data=[],stop=14):
        
        ''' 
        speedy tiles 
        schema x,y,z
        data dataframe
        '''        
        
        if not len(data): data = gdf.loc[:]
        # print(schema,stop,data.shape)

        x,y,z = schema
        if z == stop: return 0 #secondary failsafe
        bbox = mercantile.bounds(x,y,z)
        

        subset = data.loc[data['x'].between(bbox.west,bbox.east) & data['y'].between(bbox.south,bbox.north)]
        del data

        if not len(subset): return 0 

    
        vt = vector_tile_base.VectorTile()
        layer = vt.add_layer('custom_data_dan')#,x=x,y=y,zoom=z,version=3)
        layer.EXTENT=EXTENT

        # by = 13-int(z)
        by = 2**(14-int(z))
        if by < 1: return 0 


        counter = 0 

        for _,multipoint in subset.iterrows():
            cat = multipoint['cat']

            for point in np.array(multipoint['point'],dtype=object):     # [z%2::by]: 
                
                    counter += 1
                    #  if not divisible by our 2^n value, skip 
                    if (counter) % by: continue 
                
                    try:
                        feature = layer.add_point_feature()
                        feature.add_points(list(transform_geo(*bbox, *point, EXTENT))) 
                        feature.attributes = { 'cat': cat }
                    except:
                        print(f'err {p} {areagroup} {bbox}')

        
        encoded_tile = vt.serialize()
        del vt, _, multipoint,cat
        output = oloc

        print('oloc')
        try:
            with open(f'{output}/{z}/{x}/{y}.pbf','wb') as f:
                f.write(encoded_tile)
        except:
            os.popen(f'mkdir {output}/{z}  >/dev/null 2>&1').read()
            os.popen(f'mkdir {output}/{z}/{x}  >/dev/null 2>&1').read()
            with open(f'{output}/{z}/{x}/{y}.pbf','wb') as f:
                f.write(encoded_tile)
                # print('oloc',f'{output}/{z}/{x}/{y}.pbf')
        
        del encoded_tile
        # nested
        if z+1 < stop and len(subset) : 
            
            tiles = mercantile.tiles(*bbox, zooms=[z+1])
            # print('nest',z+1)
            for t in tiles:
                # recursive processing
                # print(t)
                gunwale_bobbing(t,subset,stop)
            del subset
        
        return 0 
                
    ##########################
    # Generate Summary table
    ##########################


    if not os.path.exists(f'{oloc}/ratios/'):

        geom = gpd.GeoDataFrame(geom)
        geom['ratios'] = [str(list(data.loc[i].values)).replace(' ','') for i in geom.index]
        geom.to_file(oloc+'/ratio.geojson', driver="GeoJSON")  
        os.system(f'echo "*.geojson" >> {oloc}/.gitignore')

        os.system(f'cd {oloc};rm -rf ratios; mkdir ratios/;  tippecanoe -zg --no-tile-compression --simplification=10 --simplify-only-low-zooms --no-tile-size-limit --force --read-parallel --output-to-directory=ratios/ ratio.geojson')

    del geom


    #############################
    # computations 
    #############################

    yn = gdf.y.min()
    yx = gdf.y.max()
    xn = gdf.x.min()
    xx = gdf.x.max()

    bounds = (xn,yn,xx,yx)

    # bounds = (-0.488892,51.280817,0.189514,51.699800)
    
    print(' Not deleting previous computations. You may wish to do this manually. ')
    # os.system(f'rm -rf {oloc}/')

    # 7 - 10  and 10 - 14
    # split due to RAM memory limit when using a MBP 
    startstop = [[7,9],[10,11],[11,12],[12,14]]

    # startstop=[]


    for b,e in startstop:
        print(f'Processing layers {b} - {e}')
        tiles = list(mercantile.tiles(*bounds, zooms=[b]))

        p_umap(partial(gunwale_bobbing, stop=e),tiles)

    print('continue')

  

    ##########################
    # gen switch code
    ##########################


    s = data.sum()
    s = 100*(s/s.max())
    s=s.astype(np.float16)

    options = f'''
    case "{typen}":
        keys = {selection}
        csum = {list(s.values)}
        bcsum = {list(s.values)}
        break;
    '''

    with open(f'{oloc}/switch.txt','w') as f:
        f.write(options)

    print(typen)



    if os.path.exists(f'{oloc}/.git/'):
        os.system(f'cd {oloc}; git add -A; git commit -m "update"; git push && echo "saved {typen}" ')
    else:
        cmd = f'''git init;
        git add -A;
        git commit -m "first commit";
        git branch -M main;
        git remote add origin https://github.com/ONSvisual/{typen}.git;
        # git push -u origin main;
        git push --set-upstream origin main
        '''
        os.system(cmd)







    print(options)




