<script>
    import { progressStore } from '$lib/stores';
    import { derived } from 'svelte/store';
  
    // Turn the object into an array for iteration
    const entries = derived(progressStore, ($p) =>
      Object.entries($p).map(([mode, data]) => ({ mode, ...data }))
    );
  </script>
  
  <main>
    <h1>Your Progress</h1>
    {#if $entries.length}
      <ul>
        {#each $entries as entry}
          <li>
            <strong>{entry.mode.replace('practice/', '').replace('-', ' ')}</strong><br/>
            ⭐️ Stars: {entry.stars || 0} &nbsp;•&nbsp;
            ⏱ Best Time: {entry.bestTime != null ? `${entry.bestTime}s` : '—'} &nbsp;•&nbsp;
            📅 Last: {new Date(entry.lastPlayed).toLocaleDateString()}
          </li>
        {/each}
      </ul>
    {:else}
      <p>No progress yet—complete some challenges!</p>
    {/if}
  </main>
  
  <style>
    main {
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background: #fff;
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  </style>
  