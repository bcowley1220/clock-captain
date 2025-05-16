<script>
    export let data;
  
    let menuOpen = false;
    const toggleMenu = () => (menuOpen = !menuOpen);
  </script>
  
  <header>
    <div class="logo">
      <a href="/">
        <img src="/icons/192.png" alt="Clock Captain Logo" width="40" height="40" />
        <span>Clock Captain</span>
      </a>
    </div>
  
    <!-- Hamburger button shown on mobile -->
    <button
      class="menu-toggle"
      on:click={toggleMenu}
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  
    <nav class:open={menuOpen}>
      <a href="/learn" on:click={() => (menuOpen = false)}>Learn</a>
      <a href="/practice" on:click={() => (menuOpen = false)}>Practice</a>
      <a href="/game" on:click={() => (menuOpen = false)}>Game</a>
      <a href="/progress" on:click={() => (menuOpen = false)}>Progress</a>
      <a href="/settings" on:click={() => (menuOpen = false)}>Settings</a>
    </nav>
  </header>
  
  <main>
    <slot />
  </main>
  
  <style>
    :global(body) {
      margin: 0;
      font-family: system-ui, sans-serif;
      background: #f7f8fa;
    }
  
    header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
  
    .logo {
      display: flex;
      align-items: center;
    }
  
    .logo img {
      display: block;
      margin-right: 0.5rem;
    }
  
    .logo span {
      font-size: 1.25rem;
      font-weight: bold;
      color: #333;
    }
  
    /* Desktop nav */
    nav {
      display: flex;
      gap: 1rem;
    }
  
    nav a {
      text-decoration: none;
      color: #555;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  
    nav a:hover,
    nav a:focus {
      background: #e0e4ef;
      color: #000;
    }
  
    /* Hamburger (hidden on desktop) */
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 24px;
      padding: 0;
      cursor: pointer;
    }
  
    .menu-toggle span {
      display: block;
      width: 100%;
      height: 3px;
      background: #555;
      border-radius: 2px;
    }
  
    main {
      padding: 2rem 1rem;
    }
  
    /* Mobile styles */
    @media (max-width: 768px) {
      .menu-toggle {
        display: flex;
      }
  
      nav {
        position: absolute;
        top: 100%;
        right: 0;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        flex-direction: column;
        gap: 0;
        width: 200px;
        transform: translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
  
      nav.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
  
      nav a {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #eee;
      }
  
      nav a:last-child {
        border-bottom: none;
      }
    }
  </style>
  