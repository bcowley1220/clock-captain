<script>
    const practiceModes = [
      { name: 'Set the Clock',      path: 'set-the-clock' },
      { name: 'Match the Time',     path: 'match-the-time' },
      { name: 'Elapsed Time',       path: 'elapsed-time' }
    ];
  </script>
  
  <main class="practice-page">
    <h1>Practice</h1>
  
    <nav class="practice-nav">
      {#each practiceModes as mode}
        <a href={`/practice/${mode.path}`} class="mode-link">
          {mode.name}
        </a>
      {/each}
    </nav>
  
    <!--
      If you want the child pages to render beneath this list
      (e.g. you navigate directly to /practice/set-the-clock),
      you can swap this file to +layout.svelte and include <slot /> here.
    -->
  </main>
  
  <style>
    .practice-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
  
    h1 {
      margin-bottom: 1.5rem;
      font-size: 2rem;
      color: #333;
    }
  
    .practice-nav {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 300px;
    }
  
    .mode-link {
      display: block;
      text-align: center;
      padding: 0.75rem 1rem;
      background: #ffffff;
      border: 2px solid #007bff;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      color: #007bff;
      transition: background 0.2s, color 0.2s;
    }
  
    .mode-link:hover,
    .mode-link:focus {
      background: #007bff;
      color: #fff;
    }
  </style>
  