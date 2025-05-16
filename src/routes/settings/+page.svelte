<script>
    import { onDestroy } from 'svelte';
    import { settingsStore, progressStore } from '$lib/stores';
  
    // Local bindings for the two settings
    let audio = true;
    let difficulty = 'fiveMin';
  
    // Keep our locals in sync with the store
    const unsub = settingsStore.subscribe((v) => {
      audio = v.audio;
      difficulty = v.difficulty;
    });
  
    // Update store when toggles change
    function updateAudio() {
      settingsStore.update((v) => ({ ...v, audio }));
    }
  
    function updateDifficulty() {
      settingsStore.update((v) => ({ ...v, difficulty }));
    }
  
    function resetProgress() {
      if (confirm('Clear all your progress? This cannot be undone.')) {
        progressStore.set({});
        // progressStore subscription will clear localStorage automatically
      }
    }
  
    onDestroy(unsub);
  </script>
  
  <main class="settings-page">
    <h1>Settings</h1>
  
    <div class="setting">
      <label>
        <input
          type="checkbox"
          bind:checked={audio}
          on:change={updateAudio}
        />
        Audio Feedback
      </label>
    </div>
  
    <div class="setting">
      <label for="difficulty">Difficulty Level:</label>
      <select
        id="difficulty"
        bind:value={difficulty}
        on:change={updateDifficulty}
      >
        <option value="hour">Hour Only</option>
        <option value="quarter">Quarter Hour</option>
        <option value="fiveMin">Five-Minute Increments</option>
      </select>
    </div>
  
    <div class="setting reset">
      <button on:click={resetProgress}>
        Reset All Progress
      </button>
    </div>
  </main>
  
  <style>
    .settings-page {
      max-width: 400px;
      margin: 2rem auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      font-family: system-ui, sans-serif;
    }
  
    h1 {
      text-align: center;
      font-size: 2rem;
    }
  
    .setting {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  
    label {
      font-size: 1.1rem;
    }
  
    input[type="checkbox"] {
      transform: scale(1.2);
    }
  
    select {
      padding: 0.3rem;
      font-size: 1rem;
    }
  
    .reset {
      justify-content: center;
    }
  
    .reset button {
      background: #dc3545;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    .reset button:hover {
      background: #c82333;
    }
  </style>
  