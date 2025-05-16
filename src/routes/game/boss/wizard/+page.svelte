<script>
    import { onMount } from 'svelte';
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
  
    const TOTAL = 3;
    const TIME_LIMIT = 10; // seconds
  
    let mode     = 'intro';      // 'intro' | 'battle' | 'finished'
    let idx      = 0;            // question index
    let target   = { hour: 0, minute: 0 };
    let current  = { hour: 0, minute: 0 };
    let startTs  = 0;            // ms of question start
    let timeUp   = false;
    let feedback = '';
  
    function randTime() {
      const { difficulty } = get(settingsStore);
      const h = Math.floor(Math.random()*12);
      const m = difficulty==='hour'
        ? 0
        : difficulty==='quarter'
          ? [0,15,30,45][Math.floor(Math.random()*4)]
          : 5*Math.floor(Math.random()*12);
      return { hour: h, minute: m };
    }
  
    function nextQ() {
      timeUp = false;
      feedback = '';
      target = randTime();
      current = { ...randTime() }; // random start
      startTs = Date.now();
      idx += 1;
      // schedule a time-up check
      setTimeout(() => {
        if (mode==='battle' && !feedback && (Date.now()-startTs)/1000 >= TIME_LIMIT) {
          timeUp = true;
          feedback = '⏰ Time’s up!';
        }
      }, TIME_LIMIT*1000);
    }
  
    function startBattle() {
      mode = 'battle';
      idx = 0;
      nextQ();
    }
  
    function handleChange(e) {
      current = e.detail;
    }
  
    function check() {
      if (timeUp) return;
      if (current.hour===target.hour && current.minute===target.minute) {
        if (idx < TOTAL) {
          nextQ();
        } else {
          finish(true);
        }
      } else {
        feedback = '❌ Wrong—try again!';
      }
    }
  
    function finish(won) {
      mode = 'finished';
      const totalTime = Math.round((Date.now()-startTs)/1000);
      // record
      progressStore.update(store => {
        const key = 'game/boss/wizard';
        const prev = store[key] || {};
        store[key] = {
          bestTime: !prev.bestTime || totalTime<prev.bestTime ? totalTime : prev.bestTime,
          attempts: (prev.attempts||0)+1,
          lastResult: won?'win':'lose',
          lastPlayed: new Date().toISOString()
        };
        return store;
      });
    }
  
    function cancel() {
      goto('/game');
    }
  </script>
  
  <main class="wizard-battle">
    {#if mode==='intro'}
      <h1>🔮 Chrono Wizard</h1>
      <p>Solve {TOTAL} clocks—hands move backwards! You have {TIME_LIMIT}s each.</p>
      <button on:click={startBattle}>Begin</button>
      <button on:click={cancel}>Back</button>
  
    {:else if mode==='battle'}
      <h2>Challenge {idx} of {TOTAL}</h2>
      <p>Set to <strong>
        {String(target.hour).padStart(2,'0')}:
        {String(target.minute).padStart(2,'0')}
      </strong>
      <em>({TIME_LIMIT - Math.floor((Date.now()-startTs)/1000)}s left)</em></p>
  
      <ClockFace
        hour={current.hour}
        minute={current.minute}
        interactive={true}
        reverseDrag={true}
        on:timechange={handleChange}
      />
  
      <button on:click={check} disabled={timeUp}>Check</button>
      {#if feedback}
        <p class="feedback">{feedback}</p>
        {#if timeUp}
          <button on:click={() => finish(false)}>End Battle</button>
        {/if}
      {/if}
  
    {:else}
      <h1>{feedback==='⏰ Time’s up!'?'💥 You ran out of time':'🎉 You vanquished the Wizard!'}</h1>
      {#if feedback!=='⏰ Time’s up!'}
        <p>Well done!</p>
      {/if}
      <button on:click={startBattle}>Try Again</button>
      <button on:click={cancel}>Back</button>
    {/if}
  </main>
  
  <style>
    .wizard-battle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
      text-align: center;
    }
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
    .feedback {
      color: #c00;
      font-weight: bold;
    }
  </style>
  