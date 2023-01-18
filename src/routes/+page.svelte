<script>
	import { onMount } from "svelte";
    import MapComponent from "./MapComponent.svelte";
    import Categories from "./Categories.svelte";

    import ("carbon-components-svelte/css/g100.css");
    import { Toggle,Dropdown,Search } from "carbon-components-svelte";

    let colourbase = ['ffbe0b', 'fb5607', 'ff006e', '8338ec', '3a86ff'].map(
    (d) => '#' + d
  );
  let map;
  let colour;
  let csum = [100,100,100,100,100,100]
  let legend;
  let debounce = new Date()
  let update = false
  let keytitle = 'England + Wales '
  let keycentre = false
  let type,keys,tile,bcsum;

  tile = "TS021_ethnic_group_tb_6a_2021"
  colour = [...colourbase];
  

  const names = [
    { id: "TS021_ethnic_group_tb_6a_2021", text: "Ethnicity" },
    { id: "TS002_legal_partnership_status_3a_2021", text: "Legal Partnership" },
    { id: "TS017_hh_size_5a_2021", text: "Household Size" },
    { id: "TS003_hh_family_composition_4a_2021", text:'Family Composition'}
   
  ]



async function changetile(type){

// // void
// return 0


if (!map) return 0  
console.log('changetitle',type,map,map.getSource('dot-src'))

const host = 'https://onsvisual.github.io/'
map.getSource('dot-src').setTiles([host +type+'/{z}/{x}/{y}.pbf?raw=true',])
map.getSource('ratio-src').setTiles([host +type+'/ratios/{z}/{x}/{y}.pbf?raw=true',])
// // map.getLayer('dot-data').sourceLayer=type


switch (type) {


  case "TS021_ethnic_group_tb_6a_2021":
      keys = ['Asian, Asian British or Asian Welsh', 'Black, Black British, Black Welsh, Caribbean or African', 'Mixed or Multiple ethnic groups', 'White', 'Other ethnic group']
      csum = [11.04, 4.797, 3.48, 100.0, 2.51]
      bcsum = [11.04, 4.797, 3.48, 100.0, 2.51]
    break;
  default:
      type = "TS021_ethnic_group_tb_6a_2021"
      keys = ['Asian, Asian British or Asian Welsh', 'Black, Black British, Black Welsh, Caribbean or African', 'Mixed or Multiple ethnic groups', 'White', 'Other ethnic group']
      csum = [11.04, 4.797, 3.48, 100.0, 2.51]
      bcsum = [11.04, 4.797, 3.48, 100.0, 2.51]
    break;
}


newpaint(colour);


}


    // const sources = map.style && map.style._sourceCaches;
    //         for (const id in sources) {
    //             const source = sources[id];
    //             const tiles = source._tiles;
    //             for (const t in tiles) {
    //                 const tile = tiles[t];
    //                 if (!(tile.state === 'loaded' || tile.state === 'errored')) return false;
    //             }
    //         }



    // async function tilesloaded(){
    // let loading = true
    // const tiles = map.style.sourceCaches['wdot-src']._tiles
    // while (loading){
    //   loading = tiles.length
    //   for (const t in tiles) {
                    
    //                 if (!(tiles[t].state === 'loaded' || tiles[t].state === 'errored')) loading -=1 
    //                 console.log(tiles[t])

    //             }
        

    // }
    // return 'loading complete'}

    // await tilesloaded().then(alert)




// map.style._sourceCaches['wdot-src']


  onMount(()=>{
    // document.body.classList = 'hidden'
    // document.body.classList = 'visible'
    document.body.style.opacity = 1

    colour = [...colourbase];
    legend = document.querySelector('.legend')
    map.on('load',()=>{
       changetile(tile).then(newpaint())
    })
    

    //  function screen(){

    //     if (update){
    //       csum = [100,100,100,100,100]
    //       var d = new Date();
    //       if ( d - debounce > 2000) {
    //       debounce = d;
    //       var c = [0,0,0,0,0];
    //       map.queryRenderedFeatures().forEach(d=>c[d.properties.cat]+=1);
    //       var mx = Math.max(...c);
    //       csum = c.map(d=>100.*d/mx);
    //       legend.classList.remove('loading');
    //     } else {
          
    //     }
       
    // }}


    map.on('moveend',()=>{if (update) legend.classList.add('loading')})


    const people = document.getElementById('people')



    map.on('zoomend',()=>{
      let z = Math.floor(map.getZoom());
      people.innerText = Math.ceil(2**(14-z));

      // scaling of pooints with zoom
      map.setPaintProperty('dot-data', 'circle-radius',0.1*z**.7);

      if (update) legend.classList.add('loading')
    })

    map.on('click', 'poly-layer', function (e) {
      keycentre = e.lngLat.toArray();
      if (map.getZoom()<12) map.setZoom(12)

      e = e.features[0].properties
      var c = JSON.parse(e.ratios);
      var mx = Math.max(...c);
      csum = c.map(d=>100.*d/mx);
      var npeople = c.reduce((a, b) => a + b, 0)
      keytitle = 'Output Area: '+e.OA21CD+ '  (' + npeople + ' people)'

      map.setPaintProperty('poly-layer', 'fill-outline-color', [
        'match',
        ['get', 'OA21CD'],
        e.OA21CD,
        'red',
        'rgba(200, 200, 240, 0.1)',
      ]);


      });
 
      document.getElementById('legendtitle').addEventListener('click',()=>
  map.flyTo({center:keycentre,zoom:14}))

map.on('idle',screen)

// map.areTilesLoaded('dot-data')
  })


  function newpaint () {
    
      map.setPaintProperty('dot-data', 'circle-color', [
        'match',
        ['get', 'cat'],
        0,
        colour[0],
        1,
        colour[1],
        2,
        colour[2],
        3,
        colour[3],
        4,
        colour[4],
        '#ccc',
      ]);
    }
  
$: changetile(tile)

$: try{newpaint(colour)}catch(err){}




</script>




<MapComponent bind:map />




<div class="menu">
<h1>Census Dot Density Map</h1>

<!-- <label style='float:left;font-size:small!important;margin-top:1.25em'>Use page avarage: </label> 
<Toggle size='sm' style='float:right;margin-right:30px' bind:toggled={update} />
<br>
<br><br>  -->
<br>
<label> Select Table </label>
<br>

<Dropdown
  items={names}
  bind:selectedId={tile}
/>
<br>
<label> Find Postcode </label>
<br>
<Search size="sm" on:change={async (evt)=>{
  const psc = await fetch(`https://api.postcodes.io/postcodes/${evt.target.value.toUpperCase()}`).then(d=>d.json()).then(d=>d.result)

  if (!psc) alert('Incorrect Postcode');

  map.flyTo({
  center: [psc.longitude,psc.latitude],
  zoom: 14 
}) 





}
  }/>

  <label style='display:block;padding-top:2px;padding-bottom:1em;'> 1 dot = <span id='people'/> people</label>


</div>


<a id='instruct' href="https://scribehow.com/shared/Prototype_Dot_Density_Map__yreqzD5ISB6EQr2IU9FWbg">Usage Instructions. </a>


<!-- LEGEND BARS -->
<div class="legend">

    
<label id='legendtitle' style='float:right;margin:auto;font-size:medium;'>{!update? keytitle: 'Page Avarage'} </label> <br><br>
    <Categories keys={keys} bind:colour colourbase={colourbase} csum={csum} bcsum={bcsum}/>
</div>

<style>
	:global(body) {
	  margin: 0;
	  padding: 0;
	  font-family: 'IBM Plex Sans', sans-serif;
    overflow: hidden;
    opacity: 0;
    -moz-transition: opacity 3.5s;
    -webkit-transition: opacity 3.5s;
    -o-transition: opacity 3.5s;
    transition: opacity 3.5s;
    
    
	}

  label{
    /* padding-bottom:0!important; */
    display:block;
    height: .35em;
  }
  
  h1{
    font-size: large;
  }
	:global(#map) {
	  position: absolute;
	  top: 0;
      left:0;
	  bottom: 0;
	  width: 100%;
	}
	.legend{
	  z-index: 99999999;
	  position:absolute;
	  display: block;
	  backdrop-filter: blur(3px)saturate(0.1);
	  padding:5px;
      background-color:#444;
      opacity:80%;
      border-radius: 3%;
      margin:auto;
      bottom:4px;
      align-content: center;
      right:4px;
	}
    #instruct{
	  z-index: 99999999;
	  position:absolute;
	  display: block;
      font-size: 110%;
	  backdrop-filter: blur(3px);
      border-radius: 3%;
	  padding:5px;
      bottom:4px;
      align-content: center;
      left:4px;
	}
  .menu{
	  z-index: 99999999;
	  position:absolute;
	  display: block;
	  backdrop-filter: blur(3px)saturate(0.1);
	  padding:5px;
      background-color:#444;
      opacity:80%;
      border-radius: 3%;
      margin:auto;
      top:4px;
      align-content: center;
      left:4px;
	}

  #legendtitle:hover{color:dodgerblue}
  </style>
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
	href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100&display=swap"
	rel="stylesheet"
  />
  
  