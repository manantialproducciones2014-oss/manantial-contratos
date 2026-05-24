import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        negro: '#0A0A0A',
        dorado: '#C8A951',
        crema: '#F5F0E8',
      },
    },
  },
  plugins: [],
}

export default config
