/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--color-bg)',
          text: 'var(--color-text)',
          hint: 'var(--color-muted)',
          link: 'var(--color-gold)',
          button: 'var(--color-gold)',
          buttonText: 'var(--color-bg)',
          secondaryBg: 'var(--color-card)',
        },
        gold: 'var(--color-gold)',
        card: 'var(--color-card)',
        muted: 'var(--color-muted)'
      }
    },
  },
  plugins: [],
}
