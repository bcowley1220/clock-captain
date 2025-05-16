<script>
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
  
    // prompt clock
    let target = { hour: 0, minute: 0 };
  
    // array of 4 options: { hour, minute, label }
    let options = [];
  
    // which index was clicked
    let selected = null;
  
    let feedback = '';
    let stars = 0;
    let startTime = 0;
  
    // simple Fisher–Yates shuffle
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  
    function newChallenge() {
      const { difficulty } = get(settingsStore);
      // 1️⃣ generate target time at difficulty resolution
      const h = Math.floor(Math.random() * 12);
      const m =
        difficulty === 'hour'
          ? 0
          : difficulty === 'quarter'
            ? [0, 15, 30, 45][Math.floor(Math.random() * 4)]
            : 5 * Math.floor(Math.random() * 12);
  
      target = { hour: h, minute: m };
  
      // 2️⃣ build options: correct + 3 decoys
      const correct = {
        hour: target.hour,
        minute: target.minute,
        label: `${String(target.hour).padStart(2, '0')}:${String(target.minute).padStart(2, '0')}`
      };
  
      const decoys = new Set();
      while (decoys.size < 3) {
        const dh = Math.floor(Math.random() * 12);
        const dm =
          difficulty === 'hour'
            ? 0
            : difficulty === 'quarter'
              ? [0, 15, 30, 45][Math.floor(Math.random() * 4)]
              : 5 * Math.floor(Math.random() * 12);
        const key = `${dh}-${dm}`;
        if (dh === target.hour && dm === target.minute) continue;
        decoys.add(key);
      }
  
      options = [
        correct,
        ...[...decoys].map((k) => {
          const [dh, dm] = k.split('-').map(Number);
          return {
            hour: dh,
            minute: dm,
            label: `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`
          };
        })
      ];
  
      shuffle(options);
  
      // reset state
      selected = null;
      feedback = '';
      stars = 0;
      startTime = Date.now();
    }
  
    function checkAnswer(idx) {
      selected = idx;
      const choice = options[idx];
  
      if (choice.hour === target.hour && choice.minute === target.minute) {
        feedback = '✅ Correct!';
        stars = 3;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
  
        // persist progress
        progressStore.update((all) => {
          const key = 'practice/match-the-time';
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
        feedback = '❌ Try again.';
      }
    }
  
    // initialize
    newChallenge();
  </script>
  
  <main class="match-time">
    <h2>Match the Time</h2>
    <p>Which digital time matches this clock?</p>
  
    <ClockFace
      hour={target.hour}
      minute={target.minute}
      interactive={false}
    />
  
    <div class="options">
      {#each options as opt, i}
        <button
          class:selected={selected === i}
          on:click={() => checkAnswer(i)}
          disabled={!!feedback}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  
    {#if feedback}
      <p class="feedback">{feedback}</p>
      <button on:click={newChallenge}>Next</button>
    {/if}
  </main>
  
  <style>
    .match-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  
    .options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 1rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  
    button.selected {
      background: #007bff;
      color: #fff;
    }
  
    .feedback {
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }
  </style>
  