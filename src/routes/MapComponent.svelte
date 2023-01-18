<script>
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte'

  // export NODE_OPTIONS=--max-old-space-size=8192 # increase memory to 8GB

  export let map;
  // export let colour;
  // export let type;

  onMount(()=>{
  function redraw() {
    console.log(map);
    map.redraw();
  }

  //include webgl2 in mapboxgl
  if (
    maplibregl.Map.prototype._setupPainter.toString().indexOf('webgl2') == -1
  ) {
    var _setupPainter_old = maplibregl.Map.prototype._setupPainter;
    maplibregl.Map.prototype._setupPainter = function () {
      let getContext_old = this._canvas.getContext;
      this._canvas.getContext = function (name, attrib) {
        return (
          getContext_old.apply(this, ['webgl2', attrib]) ||
          getContext_old.apply(this, ['webgl', attrib]) ||
          getContext_old.apply(this, ['experimental-webgl', attrib])
        );
      };
      _setupPainter_old.apply(this);
      this._canvas.getContext = getContext_old;
    };
  }

  
    map = (window.map = new maplibregl.Map({
    container: 'map',
    zoom: 9.5,
    pitch:5,
    center: [-0.1360581413730415, 51.514891380499904],
    style: '/style-dark.json',
    //`https://api.jawg.io/styles/jawg-dark.json?access-token=${'u8QexmjeotzH3gqD6qXyuKblwQi4DkhbOQp8Ydm6aUAjyIsvlO4RHBCedF07KIDW'}`,
    antialias: true,
  }));

  map.doubleClickZoom.disable();
  map.on('load', function () {


    // map.addSource('dot-src', {
    //   type: 'vector',
    //   maxzoom: 22, //add this line
    //   minzoom: 8, //add this line
    //   tiles: [ 
    //    'https://wolfiex.github.io/DotDensityTiles/static/'+'TS021_ethnic_group_tb_6a_2021'+'/{z}/{x}/{y}.pbf?raw=true',
    //   ],
    //   //[window.location.origin + `/${loc}/{z}/{x}/{y}.pbf`],
    // });

    // map.addLayer({
    //   id: 'dot-data',
    //   type: 'circle',
    //   source: 'dot-src',
    //   maxzoom: 22,
    //   minzoom: 8, //add this line
    //   // NEED SOURCE LAYER
    //   'source-layer': 'TS021_ethnic_group_tb_6a_2021',//'must-update-this-inscript',
    //   paint: {
    //     'circle-radius': 0.5,
    //     'circle-color': 'white',
    //     'circle-opacity': 0.83,
    //   },
    //   // filter: ['==', '$type', 'Point'],
    // });
    
//     map.addSource('rdot-src', {
//       type: 'raster',
//       "maxzoom": 9, 
//       "minzoom": 0, 
//       tiles: [ 
//         'http://localhost:8000'+ '/datashadertiles/{z}/{x}/{y}.png',
//       ],
//       'tileSize': 512*2
//     });

//     map.addLayer({
// 'id': 'r-layer',
// 'type': 'raster',
// 'source': 'rdot-src',
// 'minzoom': 0,
// 'maxzoom': 9,
// 'paint': {
//         "raster-opacity": 0.5
//     },
// })


map.setZoom(10.3)

// console.log( window.location.host+ '/output/{z}/{x}/{y}.pbf')








/////////////////////////
//// polygons
/////////////////////////

map.addSource('ratio-src', {
'type': 'vector',
"maxzoom": 13,
//       "minzoom": 0,
tiles: [ 
        'https://onsvisual.github.io/'+'TS021_ethnic_group_tb_6a_2021'+'/ratios/{z}/{x}/{y}.pbf?raw=true'
      ],
});
 
// Add a layer showing the state polygons.
map.addLayer({
'id': 'poly-layer',
'type': 'fill',
'source': 'ratio-src',
'source-layer': 'ratio',
"maxzoom": 22,
      "minzoom": 0,
'paint': {
'fill-color': 'rgba(200, 100, 240, 0)',
'fill-outline-color': 'rgba(200, 200, 240, 0.1)'
}
});
 
// When a click event occurs on a feature in the states layer, open a popup at the
// location of the click, with description HTML from its properties.


//////////////////////////
////dots
/////////////////////////






    map.addSource('dot-src', {
      type: 'vector',
      "maxzoom": 14, 
      "minzoom": 6, 
      tiles: [ 
        // 'http://localhost:8000'+ '/output/{z}/{x}/{y}.pbf',
        'https://onsvisual.github.io/'+'TS021_ethnic_group_tb_6a_2021'+'/{z}/{x}/{y}.pbf?raw=true'
      ],
    });


    const colour = ['ffbe0b', 'fb5607', 'ff006e', '8338ec', '3a86ff'].map(
    (d) => '#' + d)

    map.addLayer({
      id: 'dot-data',
      type: 'circle',
      source: 'dot-src',
      "maxzoom": 22,
      "minzoom": 4,
      // NEED SOURCE LAYER
      'source-layer': 'custom_data_dan',
      paint: {
        'circle-radius': .5,
        'circle-color':'white',
        'circle-opacity': 0.83,
      },
      filter: ['==', '$type', 'Point'],
    });











  });





  
})



</script>

<div id="map" />
