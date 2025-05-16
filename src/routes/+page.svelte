<script>
    import ClockFace from '$lib/components/ClockFace.svelte';
  
    // initial time
    let hour = 3;
    let minute = 15;
  
    // allow dragging
    const interactive = true;
  
    // update our local state whenever the user moves a hand
    function handleTimeChange(event) {
      ({ hour, minute } = event.detail);
    }
  </script>
  
  <main>
    <h1>Practice: Set the Clock</h1>
  
    <!-- display the current time as text -->
    <p>
      Selected time:
      {hour.toString().padStart(2, '0')}:
      {minute.toString().padStart(2, '0')}
    </p>
  
    <!-- our interactive clock -->
    <ClockFace
      {hour}
      {minute}
      {interactive}
      on:timechange={handleTimeChange}
    />
  </main>
  
  <style>
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      font-family: system-ui, sans-serif;
    }
  
    h1 {
      margin-bottom: 1rem;
    }
  
    p {
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
    }
  </style>
  