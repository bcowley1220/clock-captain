<script>
    import { onMount } from 'svelte';
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { settingsStore, progressStore } from '$lib/stores';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
  
    const QUESTION_TYPES = [
      'set-clock',         // Set-the-Clock (harder increments)
      'match-time',        // Match-the-Time (6 options)
      'elapsed-time',      // Elapsed-Time
      'set-clock-hard',    // Set-the-Clock (1-minute increments)
      'match-time-6opt'    // Match-the-Time (6 options)
    ];
    const TOTAL = QUESTION_TYPES.length;
    const TIME_LIMIT = 60; // total seconds
  
    // State
    let mode       = 'intro';   // 'intro' | 'battle' | 'finished'
    let idx        = 0;
    let type       = QUESTION_TYPES[0];
    let target     = {};        // shape varies by type
    let current    = {};        // shape varies by type
    let options    = [];        // for match-time modes
    let ans        = { hour: '', minute: '' }; // for elapsed-time
    let startTs    = 0;
    let feedback   = '';
    let elapsed    = 0;
  
    // Utilities to generate times
    function randIncrements(res) {
      const h = Math.floor(Math.random()*12);
      const m = res === 1
        ? Math.floor(Math.random()*60)
        : res === 5
          ? 5 * Math.floor(Math.random()*12)
          : res === 15
            ? [0,15,30,45][Math.floor(Math.random()*4)]
            : 0;
      return { hour: h, minute: m };
    }
  
    function newQuestion() {
      feedback = '';
      type = QUESTION_TYPES[idx];
      // pick target & initial current based on type
      if (type === 'set-clock') {
        target = randIncrements(get(settingsStore).difficulty === 'hour' ? 60 :
                                get(settingsStore).difficulty === 'quarter' ? 15 : 5);
        current = randIncrements(5); // start at 5-min increments
      } else if (type === 'set-clock-hard') {
        target = randIncrements(1);
        current = randIncrements(1);
      } else if (type === 'match-time') {
        target = randIncrements(
          get(settingsStore).difficulty === 'hour' ? 60 :
          get(settingsStore).difficulty === 'quarter' ? 15 : 5
        );
        // build exactly like practice match-time but 6 options
        const correct = {
          ...target,
          label: `${String(target.hour).padStart(2,'0')}:${String(target.minute).padStart(2,'0')}`
        };
        const set = new Set();
        while (set.size < 5) {
          const t = randIncrements(get(settingsStore).difficulty === 'hour' ? 60 :
                                    get(settingsStore).difficulty === 'quarter' ? 15 : 5);
          const key = `${t.hour}-${t.minute}`;
          if (key !== `${target.hour}-${target.minute}`) set.add(key);
        }
        options = [correct, ...[...set].map(k => {
          const [h,m] = k.split('-').map(Number);
          return { hour:h, minute:m, label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` };
        })];
        options.sort(() => Math.random()-0.5);
      } else if (type === 'match-time-6opt') {
        // same as match-time but always 6 options
        target = randIncrements(get(settingsStore).difficulty === 'hour' ? 60 :
                                get(settingsStore).difficulty === 'quarter' ? 15 : 5);
        const correct = {
          ...target,
          label: `${String(target.hour).padStart(2,'0')}:${String(target.minute).padStart(2,'0')}`
        };
        const set = new Set();
        while (set.size < 5) {
          const t = randIncrements(get(settingsStore).difficulty === 'hour' ? 60 :
                                    get(settingsStore).difficulty === 'quarter' ? 15 : 5);
          const key = `${t.hour}-${t.minute}`;
          if (key !== `${target.hour}-${target.minute}`) set.add(key);
        }
        options = [correct, ...[...set].map(k => {
          const [h,m] = k.split('-').map(Number);
          return { hour:h, minute:m, label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` };
        })];
        options.sort(() => Math.random()-0.5);
      } else if (type === 'elapsed-time') {
        // similar to practice
        const t = randIncrements(get(settingsStore).difficulty === 'hour' ? 60 :
                                  get(settingsStore).difficulty === 'quarter' ? 15 : 5);
        target = { start: t, duration:
          (Math.floor(Math.random()* (12*60 / (get(settingsStore).difficulty==='hour'?60:
                                               get(settingsStore).difficulty==='quarter'?15:5)))+1) *
           (get(settingsStore).difficulty==='hour'?60:
            get(settingsStore).difficulty==='quarter'?15:5)
        };
        ans = { hour:'', minute:'' };
      }
    }
  
    function startBattle() {
      mode = 'battle';
      idx  = 0;
      startTs = Date.now();
      newQuestion();
    }
  
    // Auto-check handlers
    function onTimeChange(e) {
      if (type.startsWith('set-clock')) {
        current = e.detail;
        if (current.hour===target.hour && current.minute===target.minute) advance();
      }
    }
  
    function chooseOption(i) {
      if (type.startsWith('match-time')) {
        const o = options[i];
        if (o.hour===target.hour && o.minute===target.minute) advance();
      }
    }
  
    function onInput() {
      if (type === 'elapsed-time') {
        const totalStart = target.start.hour*60+target.start.minute;
        const totalEnd = (totalStart + target.duration) % (12*60);
        const eh = Math.floor(totalEnd/60), em = totalEnd%60;
        if (Number(ans.hour)===eh && Number(ans.minute)===em) advance();
      }
    }
  
    function advance() {
      if (idx < TOTAL -1) {
        idx += 1;
        newQuestion();
      } else {
        finish(true);
      }
    }
  
    function finish(won) {
      mode = 'finished';
      elapsed = Math.round((Date.now() - startTs)/1000);
  
      progressStore.update(store => {
        const key  = 'game/boss/captain';
        const prev = store[key] || {};
        store[key] = {
          bestTime: !prev.bestTime || elapsed<prev.bestTime ? elapsed : prev.bestTime,
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
  
    // start button triggers onMount if needed
  </script>
  
  <main class="captain-battle">
    {#if mode==='intro'}
      <h1>🧑‍✈️ Time Captain</h1>
      <p>5 mixed challenges—auto check as soon as you answer. Finish all in 60 seconds!</p>
      <button on:click={startBattle}>Begin Gauntlet</button>
      <button on:click={cancel}>Back</button>
  
    {:else if mode==='battle'}
      <h2>Challenge {idx+1} of {TOTAL}</h2>
      <p>
        <em>Time left: {Math.max(0, TIME_LIMIT - Math.floor((Date.now()-startTs)/1000))}s</em>
      </p>
  
      {#if type==='set-clock' || type==='set-clock-hard'}
        <p>Set the clock to <strong>
          {String(target.hour).padStart(2,'0')}:
          {String(target.minute).padStart(2,'0')}
        </strong></p>
        <ClockFace
          hour={current.hour}
          minute={current.minute}
          interactive={true}
          on:timechange={onTimeChange}
        />
  
      {:else if type==='match-time' || type==='match-time-6opt'}
        <p>Match the time:</p>
        <ClockFace
          hour={target.hour}
          minute={target.minute}
          interactive={false}
        />
        <div class="options">
          {#each options as o, i}
            <button on:click={() => chooseOption(i)} disabled={feedback}>
              {o.label}
            </button>
          {/each}
        </div>
  
      {:else } 
        <p>
          Start at
          <strong>
            {String(target.start.hour).padStart(2,'0')}:
            {String(target.start.minute).padStart(2,'0')}
          </strong>
          and add
          <strong>{target.duration} minutes</strong>.
        </p>
        <div class="inputs">
          <input
            type="number" min="0" max="11"
            bind:value={ans.hour}
            placeholder="HH"
            on:input={onInput}
          />
          <input
            type="number" min="0" max="59"
            bind:value={ans.minute}
            placeholder="MM"
            on:input={onInput}
          />
        </div>
      {/if}
  
    {:else }  
      <h1>{feedback==='lose'?'❌ Time up!':'🎉 Victory!'}</h1>
      <p>Your time: <strong>{elapsed}s</strong></p>
      <button on:click={startBattle}>Try Again</button>
      <button on:click={cancel}>Back</button>
    {/if}
  </main>
  
  <style>
    .captain-battle {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      gap: 1rem;
      font-family: system-ui, sans-serif;
      text-align: center;
    }
    .options, .inputs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      margin: 1rem 0;
    }
    input {
      width: 3rem;
      font-size: 1rem;
      text-align: center;
      padding: 0.25rem;
    }
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
  