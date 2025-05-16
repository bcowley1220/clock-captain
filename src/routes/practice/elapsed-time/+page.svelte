<script>
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
  
    // prompt values
    let start = { hour: 0, minute: 0 };
    let duration = 0; // in minutes
  
    // user’s answer
    let ans = { hour: '', minute: '' };
  
    let feedback = '';
    let stars = 0;
    let startTime = 0;
  
    function newChallenge() {
      const { difficulty } = get(settingsStore);
  
      // random start time with difficulty resolution
      const h = Math.floor(Math.random() * 12);
      const m =
        difficulty === 'hour'
          ? 0
          : difficulty === 'quarter'
            ? [0, 15, 30, 45][Math.floor(Math.random() * 4)]
            : 5 * Math.floor(Math.random() * 12);
  
      start = { hour: h, minute: m };
  
      // random duration (5–60 mins, multiple of resolution)
      const maxSteps = 60 / (difficulty === 'hour' ? 60 : difficulty === 'quarter' ? 15 : 5);
      duration =
        (Math.floor(Math.random() * maxSteps) + 1) *
        (difficulty === 'hour' ? 60 : difficulty === 'quarter' ? 15 : 5);
  
      // reset
      ans = { hour: '', minute: '' };
      feedback = '';
      stars = 0;
      startTime = Date.now();
    }
  
    function checkAnswer() {
      const totalStart = start.hour * 60 + start.minute;
      const totalEnd = (totalStart + duration) % (12 * 60);
  
      const expHour = Math.floor(totalEnd / 60);
      const expMin = totalEnd % 60;
  
      if (
        Number(ans.hour) === expHour &&
        Number(ans.minute) === expMin
      ) {
        feedback = '✅ Nice!';
        stars = 3;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
  
        progressStore.update((all) => {
          const key = 'practice/elapsed-time';
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
  
  <main class="elapsed-time">
    <h2>Elapsed Time</h2>
    <p>
      Start at
      <strong>
        {start.hour.toString().padStart(2, '0')}:
        {start.minute.toString().padStart(2, '0')}
      </strong>
      and add
      <strong>{duration} minutes</strong>.
    </p>
  
    <div class="inputs">
      <label>
        Hour:
        <input
          type="number"
          min="0"
          max="11"
          bind:value={ans.hour}
          disabled={!!feedback}
        />
      </label>
      <label>
        Minute:
        <input
          type="number"
          min="0"
          max="59"
          bind:value={ans.minute}
          disabled={!!feedback}
        />
      </label>
    </div>
  
    <button on:click={checkAnswer} disabled={!!feedback}>
      Check
    </button>
  
    {#if feedback}
      <p class="feedback">{feedback}</p>
      <button on:click={newChallenge}>Next</button>
    {/if}
  </main>
  
  <style>
    .elapsed-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  
    .inputs {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }
  
    label {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    input {
      width: 3rem;
      text-align: center;
      font-size: 1rem;
      padding: 0.25rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  
    .feedback {
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }
  </style>
  