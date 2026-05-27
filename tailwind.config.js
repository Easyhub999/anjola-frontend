/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Premium font families
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      // Refined color palette — rose gold + champagne + deep plum
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        champagne: {
          50: '#fefcf3',
          100: '#fdf6e3',
          200: '#faecc7',
          300: '#f5dda0',
          400: '#efc975',
          500: '#e8b44c',
          600: '#d4963a',
          700: '#b17530',
          800: '#8f5d2c',
          900: '#764d28',
        },
        plum: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        rosegold: {
          50: '#fef7f0',
          100: '#fdebd7',
          200: '#fbd5ae',
          300: '#f8b87b',
          400: '#f49346',
          500: '#f17722',
          600: '#e25d18',
          700: '#bb4516',
          800: '#95381a',
          900: '#793118',
        }
      },

      // Custom animations
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'gradient': 'gradient 3s ease infinite',
        'fadeIn': 'fadeIn 0.6s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.7s ease-out forwards',
        'fadeInDown': 'fadeInDown 0.7s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.8s ease-out',
        'slideInRight': 'slideInRight 0.8s ease-out',
        'slideInUp': 'slideInUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'tilt': 'tilt 10s ease-in-out infinite',
        'reveal': 'reveal 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'text-reveal': 'textReveal 0.8s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },

      // Keyframes
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        reveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(236, 72, 153, 0.3)' },
          '50%': { borderColor: 'rgba(168, 85, 247, 0.6)' },
        },
        textReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
      },

      // Extended background sizes
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },

      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Luxury box shadows
      boxShadow: {
        'luxury': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'luxury-xl': '0 30px 80px rgba(0, 0, 0, 0.15)',
        'pink-glow': '0 0 30px rgba(236, 72, 153, 0.2)',
        'purple-glow': '0 0 30px rgba(168, 85, 247, 0.2)',
        'rose-glow': '0 10px 40px rgba(236, 72, 153, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'inner-glow': 'inset 0 0 20px rgba(236, 72, 153, 0.1)',
      },

      // Border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Transitions
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],

  corePlugins: {
    backdropBlur: true,
    backdropFilter: true,
  },
}
