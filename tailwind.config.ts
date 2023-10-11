import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },      
      keyframes: {
        spinTowards: {
          '0%': { transform: 'rotateY(0deg) scaleX(1)' },
          '50%': { transform: 'rotateY(90deg) scaleX(0.1)' },
          '100%': { transform: 'rotateY(180deg) scaleX(1)' },
        },
        spinAway: {
            '0%': { transform: 'rotateY(180deg) scaleX(1)' },
            '50%': { transform: 'rotateY(270deg) scaleX(0.1)' },
            '100%': { transform: 'rotateY(360deg) scaleX(1)' },
          }
      },
      animation: {
        spinTowards: 'spinTowards 1s forwards',
        spinAway: 'spinAway 1s forwards',
      }
    }
  },
  plugins: [],
}
export default config
