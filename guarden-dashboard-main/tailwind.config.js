/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Consolas', 'monospace'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        garden: {
          // Base — creamy botanical whites
          void:     '#F5FAF6',  // page background, the "negative space"
          base:     '#EBF5EC',  // subtle tint layer under content
          surface:  '#FFFFFF',  // primary white surface
          card:     '#F0FAF1',  // card fill, just a whisper of green
          border:   '#B8DDB8',  // soft sage border
          muted:    '#7FB87F',  // de-emphasized ui elements

          // Text — deep forest greens (legible on light bg)
          text:     '#1B3A2A',  // primary body text
          dim:      '#4A7C59',  // secondary / captions

          // Accent
          live:     '#00A550',  // active/live indicator (readable green)

          // Plant identities — slightly desaturated for daylight
          tomato:   '#D94F4F',
          okra:     '#2E9E6E',
          eggplant: '#9C6BAE',

          // Status
          warn:     '#E6A817',
          danger:   '#D94F4F',
          good:     '#00A550',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.6s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' }
        }
      },
      boxShadow: {
        'glow-tomato':   '0 0 24px 0 rgba(217, 79,  79,  0.14)',
        'glow-okra':     '0 0 24px 0 rgba(46,  158, 110, 0.14)',
        'glow-eggplant': '0 0 24px 0 rgba(156, 107, 174, 0.14)',
        'glow-live':     '0 0 12px 0 rgba(0,   165, 80,  0.28)',
        'card':          '0 2px 16px 0 rgba(27,  58, 42,  0.08)',
      }
    }
  },
  plugins: []
}
