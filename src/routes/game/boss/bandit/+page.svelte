<script>
    import { onMount } from 'svelte';
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
  
    // Boss config
    const TOTAL_QUESTIONS = 5;
    const MAX_RESETS     = 3;
  
    // State
    let mode          = 'intro';   // 'intro' | 'battle' | 'finished'
    let questionIndex = 0;          // 0 … TOTAL_QUESTIONS-1
    let resetsLeft    = MAX_RESETS;
    let target        = { hour: 0, minute: 0 };
    let current       = { hour: 0, minute: 0 };
    let pending       = { hour: 0, minute: 0 };
    let spinning      = false;
    let feedback      = '';
    let startTime     = 0;
    let elapsed       = 0;
  
    // Bring in difficulty to pick increments
    function randTime() {
      const { difficulty } = get(settingsStore);
      const h = Math.floor(Math.random() * 12);
      const m = difficulty === 'hour'
        ? 0
        : difficulty === 'quarter'
          ? [0,15,30,45][Math.floor(Math.random()*4)]
          : 5 * Math.floor(Math.random()*12);
      return { hour: h, minute: m };
    }
  
    function startBattle() {
      mode       = 'battle';
      questionIndex = 0;
      resetsLeft    = MAX_RESETS;
      startTime     = Date.now();
      nextQuestion();
    }
  
    // Prepare next question: set target & pending start, spin
    function nextQuestion() {
      target  = randTime();
      pending = { hour: Math.floor(Math.random()*12), minute: Math.floor(Math.random()*60) };
      feedback = '';
      spinning = true;
    }
  
    // After spin, apply pending to current
    function onSpinEnd() {
      current  = { ...pending };
      spinning = false;
    }
  
    // User drag handler
    function handleTimeChange(e) {
      current = e.detail;
    }
  
    // Reset start-time if they want a new view
    function resetStart() {
      if (resetsLeft > 0) {
        resetsLeft -= 1;
        pending = { hour: Math.floor(Math.random()*12), minute: Math.floor(Math.random()*60) };
        spinning = true;
        feedback = '';
      }
    }
  
    // Check their answer
    function checkAnswer() {
      if (current.hour === target.hour && current.minute === target.minute) {
        // move on or finish
        if (questionIndex < TOTAL_QUESTIONS - 1) {
          questionIndex += 1;
          nextQuestion();
        } else {
          // battle complete
          mode    = 'finished';
          elapsed = Math.round((Date.now() - startTime)/1000);
  
          // record in progressStore
          progressStore.update(all => {
            const key  = 'game/boss/bandit';
            const prev = all[key] || {};
            const better = prev.bestTime == null || elapsed < prev.bestTime;
            all[key] = {
              bestTime: better ? elapsed : prev.bestTime,
              attempts: (prev.attempts || 0) + 1,
              lastResult: 'win',
              lastPlayed: new Date().toISOString()
            };
            return all;
          });
        }
      } else {
        feedback = '❌ Not quite—try again.';
      }
    }
  
    // If they bail, go back to main menu
    function cancel() {
      goto('/game');
    }
  
    onMount(() => {
      // nothing to do until they click “Begin”
    });
  </script>
  
  <main class="boss-battle">
    {#if mode === 'intro'}
      <h1>🦹‍♂️ Time Bandit</h1>
      <p>5 challenges, but watch out — you only get {MAX_RESETS} “Reset Start”s!</p>
      <button on:click={startBattle}>Begin Challenge</button>
      <button on:click={cancel}>Back to Game Menu</button>
  
    {:else if mode === 'battle'}
      <h2>Question {questionIndex + 1} of {TOTAL_QUESTIONS}</h2>
      <p>
        Set the clock to
        <strong>
          {String(target.hour).padStart(2,'0')}:
          {String(target.minute).padStart(2,'0')}
        </strong>
      </p>
  
      <div
        class="spin-container"
        class:spinning={spinning}
        on:animationend={onSpinEnd}
      >
        <ClockFace
          hour={current.hour}
          minute={current.minute}
          interactive={true}
          on:timechange={handleTimeChange}
        />
      </div>
  
      <div class="controls">
        <button on:click={checkAnswer}>Check</button>
        <button on:click={resetStart} disabled={resetsLeft===0}>
          🔄 Reset Start ({resetsLeft})
        </button>
      </div>
  
      {#if feedback}
        <p class="feedback">{feedback}</p>
      {/if}
  
    {:else if mode === 'finished'}
      <h1>🎉 You outsmarted the Time Bandit!</h1>
      <p>Your total time: <strong>{elapsed}s</strong></p>
      <button on:click={startBattle}>Try Again</button>
      <button on:click={cancel}>Back to Game Menu</button>
    {/if}
  </main>
  
  <style>
    .boss-battle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
      text-align: center;
    }
    .controls {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
    .feedback {
      color: #c00;
      font-weight: bold;
    }
    .spin-container {
      display: inline-block;
    }
    @keyframes spin360 {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .spin-container.spinning {
      animation: spin360 0.7s ease-in-out;
    }
  </style>
  