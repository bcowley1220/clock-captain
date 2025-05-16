<script>
    import ClockFace from '$lib/components/ClockFace.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
  
    // Define each tutorial step
    const steps = [
      {
        title: 'The Hour Hand',
        description: 'This is the hour hand. It is the shorter hand and points to the current hour.',
        time: { hour: 3, minute: 0 }
      },
      {
        title: 'The Minute Hand',
        description: 'This is the minute hand. It is the longer hand and points to the current minute.',
        time: { hour: 3, minute: 15 }
      },
      {
        title: 'Quarter Past',
        description: 'When the minute hand points at the 3, it means quarter past the hour.',
        time: { hour: 2, minute: 15 }
      },
      {
        title: 'Half Past',
        description: 'When the minute hand points at the 6, it means half past the hour.',
        time: { hour: 4, minute: 30 }
      },
      {
        title: 'Quarter To',
        description: 'When the minute hand points at the 9, it means quarter to the next hour.',
        time: { hour: 5, minute: 45 }
      }
    ];
  
    let step = 0;
    // Destructure current time from the first step
    let { hour, minute } = steps[0].time;
  
    // Move to a specific step, update clock time, and speak its description
    function goStep(i) {
      step = i;
      const t = steps[i].time;
      hour = t.hour;
      minute = t.minute;
      speak(steps[i].description);
    }
  
    const next = () => step < steps.length - 1 && goStep(step + 1);
    const prev = () => step > 0 && goStep(step - 1);
  
    // Use Web Speech API to speak a given text
    function speak(text) {
      if (!browser) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      speechSynthesis.cancel(); // stop any ongoing speech
      speechSynthesis.speak(u);
    }
  
    // On first load, speak the initial step
    onMount(() => {
      speak(steps[0].description);
    });
  </script>
  
  <main class="learn-page">
    <h1>Learn: {steps[step].title}</h1>
  
    <div class="tutorial">
      <!-- Demo clock (non-interactive) -->
      <ClockFace
        {hour}
        {minute}
        interactive={false}
      />
  
      <div class="info">
        <p>{steps[step].description}</p>
  
        <div class="controls">
          <button on:click={prev} disabled={step === 0}>◀ Previous</button>
          <button on:click={next} disabled={step === steps.length - 1}>Next ▶</button>
          <button on:click={() => speak(steps[step].description)}>🔊 Replay</button>
        </div>
  
        <p class="progress">Step {step + 1} of {steps.length}</p>
      </div>
    </div>
  </main>
  
  <style>
    .learn-page {
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
      text-align: center;
    }
  
    .tutorial {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
    }
  
    .info {
      max-width: 400px;
    }
  
    .controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 1rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  
    .progress {
      margin-top: 0.5rem;
      color: #666;
    }
  
    @media (min-width: 700px) {
      .tutorial {
        flex-direction: row;
        align-items: flex-start;
      }
      .info {
        text-align: left;
      }
    }
  </style>
  