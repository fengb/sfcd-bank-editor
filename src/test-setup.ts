/**
 * jsdom ships `window.screen` but not `window.screen.orientation`, and Quasar's
 * Screen plugin destructures `type` off it while `app.use(Quasar)` runs — so
 * every mount would throw before it rendered. A fixed portrait reading is all
 * it reads; the change listener is never fired under jsdom anyway.
 */
if (window.screen.orientation === undefined) {
  Object.defineProperty(window.screen, 'orientation', {
    configurable: true,
    value: {
      type: 'portrait-primary',
      angle: 0,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  })
}
