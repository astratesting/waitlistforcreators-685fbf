import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        cream: '#fff7ed',
        flame: '#f97316',
        grape: '#7c3aed'
      },
      boxShadow: {
        glow: '0 25px 80px rgba(124, 58, 237, 0.22)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}

export default config
