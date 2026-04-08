import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mq-primary':   '#0AF3CD',
        'mq-secondary': '#B9F8DD',
        'mq-dark':      '#0A2E2A',
        'mq-mid':       '#05A88E',
        'mq-bg':        '#E8FDF7',
        dim: {
          1: '#fdcb5e',
          2: '#EC4899',
          3: '#ff7b7a',
          4: '#ff9f43',
          5: '#00c9a7',
          6: '#2d4a8a',
          7: '#a78bfa',
        },
      },
      boxShadow: {
        card:       '0 2px 12px rgba(10,46,42,0.07)',
        'card-hover': '0 4px 20px rgba(10,46,42,0.12)',
        modal:      '0 8px 32px rgba(10,46,42,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
