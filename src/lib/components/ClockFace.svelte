<script>
    import { createEventDispatcher, onMount } from 'svelte';
  
    export let hour = 0;           // 0–23
    export let minute = 0;         // 0–59
    export let interactive = false;
    export let reverseDrag = false;
  
    const dispatch = createEventDispatcher();
  
    let tickAudio;
    // Compute rotation angles
    $: minuteAngle = minute * 6;                       // 360°/60
    $: hourAngle   = ((hour % 12) * 30) + minute * 0.5; // 360°/12 + smooth
  
    let svgEl;
    let dragging = null; // 'hour' or 'minute'

    let lastMinute = minute;
    let lastHour   = hour;
  
    function pointerDown(e, type) {
      if (!interactive) return;
      dragging = type;
      svgEl.setPointerCapture(e.pointerId);
    }
  
    function pointerUp(e) {
      if (!interactive) return;
      dragging = null;
    }
  
    function pointerMove(e) {
      if (!interactive || !dragging) return;
      const { left, top, width, height } = svgEl.getBoundingClientRect();
      const cx = left + width/2;
      const cy = top  + height/2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      let angle = Math.atan2(dy, dx) * (180/Math.PI) + 90;
      const norm = (angle + 360) % 360;

      // if reverseDrag, mirror the angle around 180°
      if (reverseDrag) {
        angle = (540 - angle) % 360; 
      }
  
      if (dragging === 'minute') {
        const newMinute = Math.round(norm / 6) % 60;
        dispatch('timechange', { hour, minute: newMinute });
        tickAudio.currentTime = 0;
        tickAudio.play();
      } else {
        // convert to hour + fractional
        const rawHour = norm / 30;
        const newHour = Math.floor(rawHour) % 12;
        const newMinute = Math.round((rawHour % 1) * 60);
        dispatch('timechange', { hour: newHour, minute: newMinute });
        tickAudio.currentTime = 0;
        tickAudio.play();
      }
    }
    
    onMount(() => {
        // points at /static/sounds/hand-tick.mp3
        tickAudio = new Audio('/sounds/hand-tick.mp3');
        tickAudio.volume = 0.5;
    });
  </script>
  
  <svg
    bind:this={svgEl}
    viewBox="0 0 200 200"
    class="clock-face"
    on:pointermove={pointerMove}
    on:pointerup={pointerUp}
    on:pointerleave={pointerUp}
  >
    <!-- Outer circle -->
    <circle cx="100" cy="100" r=" ninety" stroke="#333" stroke-width="4" fill="#fff" />
  
    <!-- Hour marks -->
    {#each Array(12) as _, i}
      <line
        x1="100"
        y1="20"
        x2="100"
        y2="30"
        stroke="#333"
        stroke-width="4"
        transform="rotate({i * 30} 100 100)"
      />
    {/each}
  
    <!-- Minute marks (optional) -->
    {#each Array(60) as _, i}
      {#if i % 5 !== 0}
        <line
          x1="100"
          y1="20"
          x2="100"
          y2="25"
          stroke="#666"
          stroke-width="2"
          transform="rotate({i * 6} 100 100)"
        />
      {/if}
    {/each}
  
    <!-- Hour hand -->
    <line
      class="hand hour"
      x1="100"
      y1="100"
      x2="100"
      y2="60"
      stroke="#333"
      stroke-width="6"
      stroke-linecap="round"
      transform="rotate({hourAngle} 100 100)"
      on:pointerdown|preventDefault={(e) => pointerDown(e, 'hour')}
    />
  
    <!-- Minute hand -->
    <line
      class="hand minute"
      x1="100"
      y1="100"
      x2="100"
      y2="40"
      stroke="#e65"
      stroke-width="4"
      stroke-linecap="round"
      transform="rotate({minuteAngle} 100 100)"
      on:pointerdown|preventDefault={(e) => pointerDown(e, 'minute')}
    />
  
    <!-- Center pivot -->
    <circle cx="100" cy="100" r="5" fill="#333" />
  </svg>
  
  <style>
    .clock-face {
      width: 200px;
      height: 200px;
      touch-action: none; /* allow pointer events */
      user-select: none;
    }
    .hand {
      cursor: pointer;
    }
    .hand.hour:hover,
    .hand.minute:hover {
      stroke-opacity: 0.7;
    }
  </style>
  