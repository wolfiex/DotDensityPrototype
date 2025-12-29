<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { rings } from './circledata.js';

  let go = false;

  export let backgroundColor = '#202226';

  onMount(() => {
    setTimeout(() => {
      go = true;
    }, 2000);
  });
</script>

{#if !go}
  <div id="shell" out:fade={{ duration: 500 }} style:background-color={backgroundColor}>
    <div class="loader-content">
      <svg class="rings" width="280" height="280" viewBox="-184 -184 367 367">
        {#each Object.entries(rings) as [key, data], i}
          <circle
            id={key}
            cx="0"
            cy="0"
            r={data.r}
            stroke={data.colour}
            stroke-width={data.width}
            fill="none"
            stroke-dasharray={data.dasharray}
            opacity=".5"
            style="animation-duration: {20 + i * 10}s;"
          />
        {/each}
      </svg>
      
      <div class="credits">
        <!-- Personal logo -->
        <div class="credit-row">
          <svg class="personal-logo" viewBox="0 0 100 100" width="36" height="36">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="12" fill="#0c0c0c"/>
            <text x="50" y="62" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="url(#grad)" text-anchor="middle">D</text>
          </svg>
          <span class="credit-text">Daniel Ellis</span>
        </div>

        <!-- Designed at ONS -->
        <div class="credit-row">
          <span class="credit-label">designed at</span>
        </div>
        <div class="credit-row logo-row">
          <!-- Official ONS UK Logo from cdn.ons.gov.uk -->
          <img src="https://cdn.ons.gov.uk/assets/images/ons-logo/v2/ons-logo.svg" alt="Office for National Statistics" class="ons-logo" />
        </div>

        <!-- For Census 2021 -->
        <div class="credit-row">
          <span class="credit-label">for</span>
        </div>
        <div class="credit-row logo-row">
          <!-- Census 2021 Logo -->
          <svg class="census-logo" viewBox="0 0 200 45" width="160" height="36">
            <text x="0" y="32" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="white">Census</text>
            <text x="115" y="32" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="300" fill="#27A0CC">2021</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  #shell {
    position: fixed;
    inset: 0;
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .rings {
    margin-bottom: 10px;
  }

  circle:nth-child(even) {
    animation: spin-reverse 45s linear infinite;
  }
  
  circle:nth-child(odd) {
    animation: spin 65s linear infinite;
  }

  circle {
    will-change: transform;
    transform-origin: 0 0;
  }

  @keyframes spin {
    to { transform: rotate(1turn); }
  }
  
  @keyframes spin-reverse {
    to { transform: rotate(-1turn); }
  }

  .credits {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .credit-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-row {
    margin-bottom: 12px;
  }

  .credit-label {
    color: #666;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .credit-text {
    color: white;
    font-size: 1rem;
    font-weight: 500;
  }

  .personal-logo {
    border-radius: 5px;
  }

  .ons-logo {
    width: 200px;
    height: auto;
  }

  .census-logo {
    display: block;
  }
</style>
