/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
      fontFamily: {
        'primary': 'var(--font-primary)',
        'secondary': 'var(--font-secondary)',
        'mono': 'var(--font-mono)',
        'sans': 'var(--font-primary)',
        'serif': 'ui-serif',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      fontWeight: {
        'light': 'var(--font-light)',
        'normal': 'var(--font-normal)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
      lineHeight: {
        'tight': 'var(--leading-tight)',
        'normal': 'var(--leading-normal)',
        'relaxed': 'var(--leading-relaxed)',
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			border: 'hsl(var(--border))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--color-success) / <alpha-value>)',
  				foreground: 'hsl(var(--color-success-foreground) / <alpha-value>)'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)',
  				foreground: 'hsl(var(--color-warning-foreground) / <alpha-value>)'
  			},
  			error: {
  				DEFAULT: 'hsl(var(--color-error) / <alpha-value>)',
  				foreground: 'hsl(var(--color-error-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			score: {
  				low: '#ef4444',
  				medium: '#eab308',
  				high: '#22c55e'
  			},
  			priority: {
  				p0: '#dc2626',
  				p1: '#ea580c',
  				p2: '#ca8a04',
  				p3: '#2563eb',
  				p4: '#6b7280'
  			},
  			category: {
  				ai: '#8b5cf6',
  				web: '#06b6d4',
  				mobile: '#10b981',
  				data: '#f59e0b',
  				devops: '#ef4444',
  				security: '#dc2626'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.2s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			pulseSubtle: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.8'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}