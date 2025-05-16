<script>
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
  
    let target = { hour: 0, minute: 0 };
    let current = { hour: 0, minute: 0 };
    let pendingCurrent = { hour: 0, minute: 0 };
    let spinning = false;
    let feedback = '';
    let stars = 0;
    let startTime
  
    function newChallenge() {
        startTime = Date.now(); 
      const { difficulty } = get(settingsStore);
  
      const h = Math.floor(Math.random() * 12);
      const m = difficulty === 'hour'
        ? 0
        : difficulty === 'quarter'
          ? [0,15,30,45][Math.floor(Math.random() * 4)]
          : 5 * Math.floor(Math.random() * 12);
  
      target = { hour: h, minute: m };
      pendingCurrent = {
        hour: Math.floor(Math.random() * 12),
        minute: Math.floor(Math.random() * 60)
      };
  
      feedback = '';
      stars = 0;
      spinning = true;
    }
  
    function handleAnimationEnd() {
      current = { ...pendingCurrent };
      spinning = false;
    }
  
    function handleTimeChange(e) {
      current = e.detail;
    }
  
    function checkAnswer() {
      if (current.hour === target.hour && current.minute === target.minute) {
        feedback = '✅ Perfect!';
        stars = 3;
        // TODO: update progressStore here
        const elapsed = Math.round((Date.now() - startTime) / 1000); // in seconds
        progressStore.update((all) => {
          const key = 'practice/set-the-clock';
          const prev = all[key] || {};
          const betterTime = prev.bestTime == null || elapsed < prev.bestTime;
          all[key] = {
            stars: Math.max(prev.stars || 0, stars),
            bestTime: betterTime ? elapsed : prev.bestTime,
            lastPlayed: new Date().toISOString()
          };
          return all;
        });
      } else {
        feedback = '❌ Not quite—try again.';
      }
    }
  
    newChallenge();
  </script>
  
  <main class="set-the-clock">
    <h2>Set the Clock</h2>
    <p>
      ⏰ Please set the clock to
      <strong>
        {target.hour.toString().padStart(2,'0')}:
        {target.minute.toString().padStart(2,'0')}
      </strong>
    </p>
  
    <div
      class="spin-container"
      class:spinning={spinning}
      on:animationend={handleAnimationEnd}
    >
      <ClockFace
        hour={current.hour}
        minute={current.minute}
        interactive={true}
        on:timechange={handleTimeChange}
      />
    </div>
  
    <button on:click={checkAnswer} disabled={!!feedback}>
      Check
    </button>
  
    {#if feedback}
      <p class="feedback">{feedback} {stars ? '⭐️'.repeat(stars) : ''}</p>
      <button on:click={newChallenge}>Next</button>
    {/if}
  </main>
  
  <style>
    .set-the-clock {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
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
  
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }
  
    .feedback {
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }
  </style>
  