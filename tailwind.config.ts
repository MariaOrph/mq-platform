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
      },
    },
  },
  plugins: [],
}

export default config
