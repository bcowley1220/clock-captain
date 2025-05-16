<script>
    import { onMount } from 'svelte';
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
  
    // how many questions per race
    const RACE_LENGTH = 5;
  
    // UI state
    let mode = null;       // null | 'race' | 'finished'
    let questionIndex = 0; // 0 … RACE_LENGTH-1
    let target = { hour: 0, minute: 0 };
    let current = { hour: 0, minute: 0 };
    let feedback = '';
    let startTime = 0;
    let elapsed = 0;
  
    // generate a new set-the-clock challenge
    function nextQuestion() {
      const { difficulty } = get(settingsStore);
      // pick target
      const h = Math.floor(Math.random() * 12);
      const m =
        difficulty === 'hour'
          ? 0
          : difficulty === 'quarter'
            ? [0, 15, 30, 45][Math.floor(Math.random() * 4)]
            : 5 * Math.floor(Math.random() * 12);
  
      target = { hour: h, minute: m };
  
      // randomize starting clock
      current = {
        hour: Math.floor(Math.random() * 12),
        minute: Math.floor(Math.random() * 60)
      };
  
      feedback = '';
    }
  
    function startRace() {
      mode = 'race';
      questionIndex = 0;
      startTime = Date.now();
      nextQuestion();
    }
  
    function handleTimeChange(e) {
      current = e.detail;
    }
  
    function checkAnswer() {
      if (
        current.hour === target.hour &&
        current.minute === target.minute
      ) {
        // correct, move on
        if (questionIndex < RACE_LENGTH - 1) {
          questionIndex += 1;
          nextQuestion();
        } else {
          // race finished
          elapsed = Math.round((Date.now() - startTime) / 1000);
          mode = 'finished';
  
          // persist best race time
          progressStore.update((all) => {
            const key = 'game/race';
            const prev = all[key] || {};
            const better = prev.bestTime == null || elapsed < prev.bestTime;
            all[key] = {
              bestTime: better ? elapsed : prev.bestTime,
              lastPlayed: new Date().toISOString()
            };
            return all;
          });
        }
      } else {
        feedback = '❌ Not quite—try again.';
      }
    }
  </script>
  
  <main class="game-page">
    {#if mode === null}
      <h1>Game Mode</h1>
      <button on:click={startRace}>🏁 Start Race Against the Captain</button>
      <button on:click={() => goto('/game/boss/bandit')}>
        🦹‍♂️ Time Bandit
      </button>
        <button on:click={() => goto('/game/boss/wizard')}>
            🔮 Chrono Wizard
        </button>
        <button on:click={() => goto('/game/boss/captain')}>
            🧑‍✈️ Time Captain
        </button>
    {:else if mode === 'race'}
      <h2>Question {questionIndex + 1} of {RACE_LENGTH}</h2>
      <p>Set the clock to <strong>{target.hour.toString().padStart(2,'0')}:{target.minute.toString().padStart(2,'0')}</strong></p>
  
      <ClockFace
        hour={current.hour}
        minute={current.minute}
        interactive={true}
        on:timechange={handleTimeChange}
      />
  
      <button on:click={checkAnswer}>Check</button>
      {#if feedback}
        <p class="feedback">{feedback}</p>
      {/if}
    {:else if mode === 'finished'}
      <h1>🎉 You finished!</h1>
      <p>Your time: <strong>{elapsed}s</strong></p>
      <button on:click={startRace}>Race Again</button>
    {/if}
  </main>
  
  <style>
    .game-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
    }
  
    button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
  
    .feedback {
      color: #c00;
      font-size: 1.1rem;
    }
  </style>

