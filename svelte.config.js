// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // swap out vitePreprocess() for sveltePreprocess()
  preprocess: sveltePreprocess(),

  kit: {
    adapter: adapter()
    // …any other kit settings you have
  }
};

export default config;
