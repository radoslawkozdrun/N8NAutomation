/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color scheme for scores and priorities
        score: {
          low: '#ef4444',    // red-500
          medium: '#eab308', // yellow-500
          high: '#22c55e',   // green-500
        },
        priority: {
          p0: '#dc2626',     // red-600 - BREAKING
          p1: '#ea580c',     // orange-600 - TRENDING
          p2: '#ca8a04',     // yellow-600 - TIMELY
          p3: '#2563eb',     // blue-600 - EVERGREEN
          p4: '#6b7280',     // gray-500 - FILLER
        },
        category: {
          ai: '#8b5cf6',     // violet-500
          web: '#06b6d4',    // cyan-500
          mobile: '#10b981', // emerald-500
          data: '#f59e0b',   // amber-500
          devops: '#ef4444', // red-500
          security: '#dc2626', // red-600
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}