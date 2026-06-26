import { defineConfig } from 'vitest/config'

// base: './' keeps asset URLs relative so the static build works on any host,
// including GitHub Pages project subpaths. test runs in jsdom for localStorage.
export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
  },
})
