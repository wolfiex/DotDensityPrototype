<svelte:head>

    <link rel="stylesheet" href="/coloris.min.css"/>
    <script src="/coloris.min.js"></script>
</svelte:head>

<script>

import {ProgressBar} from 'carbon-components-svelte'
	import { onMount } from 'svelte';

export let csum;
export let keys=[];
export let colour;
export let colourbase;


onMount(()=>{
  console.warn(colour,'col')
  setTimeout(() => {
    bcupdate(colour)
  }, 1000);


})

async function bcupdate(colour){
    if (colour){
        colour.forEach((c,i)=>{
            try{
            document.querySelector(`#cat_${i} div.bx--progress-bar__bar`).style['background-color'] = c 
            }catch(err){}
        
        })
    
}}

function update_colour(i) {
    
      if (colour[i] === 'transparent') {
        colour[i] = colourbase[i];
      } else {
        colour[i] = 'transparent';
      }

      
    }


    function reset_colour(i) {
    
      colour[i] = colourbase[i];


    
  }  



$: { keys.forEach((d,i)=>{reset_colour(i)})}  // reset colours
$: bcupdate(colour)


</script>

<main>


<span> ::calculating::   </span>

{#each keys.map((d,i)=>[i,d]) as [i,cat]}
  
<div class='lk' on:click={()=>update_colour(i)}>
    
    <!-- <input type="text" class="coloris" value="rgb(255, 0, 0)" /> -->
    <ProgressBar
    value={1+csum[i]}
    labelText={cat}
    id={'cat_'+i}
    helperText=''
  />

</div>
  {/each}

</main>

<style>
/* h2{
    font-size: 1.5rem;
    text-decoration: underline;
} */

span{
    opacity: 0;
    float:right;
}

.lk{
    padding:1px;
    padding-top:4px;
    margin-top:2px
}

:global(.loading .bx--progress-bar__bar) {
    opacity: 0.8;
    /* filter:blur(10); */
    animation: blinker 4s linear infinite;
}

:global(.loading span) {
    opacity:1;
    color:rgb(255, 255, 255);
    font-size: medium;
    /* filter:blur(10); */
    animation: blinker 4s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0.4;
  }
}

</style>
