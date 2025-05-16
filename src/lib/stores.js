// src/lib/stores.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createLocalStore(key, initial) {
  // On the server we just use the initial value
  const startValue = browser
    ? (() => {
        try {
          const json = localStorage.getItem(key);
          return json ? JSON.parse(json) : initial;
        } catch {
          return initial;
        }
      })()
    : initial;

  const store = writable(startValue);

  // Only subscribe (and write back) in the browser
  if (browser) {
    store.subscribe((val) => {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch {
        // quota exceeded or private mode
      }
    });
  }

  return store;
}

// Progress: keys like 'practice/set-the-clock'
export const progressStore = createLocalStore(
  'clock-captain-progress',
  {}
);

// Settings: { audio: true, difficulty: 'fiveMin' }
export const settingsStore = createLocalStore(
  'clock-captain-settings',
  { audio: true, difficulty: 'fiveMin' }
);
