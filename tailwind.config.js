/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Custom animations for luxury effects
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'gradient': 'gradient 3s ease infinite',
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.8s ease-out',
        'slideInRight': 'slideInRight 0.8s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Keyframes for animations
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
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      
      // Extended background sizes for gradient animations
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
      
      // Custom backdrop blur values (if needed)
      backdropBlur: {
        xs: '2px',
      },
      
      // Extended box shadows for luxury depth
      boxShadow: {
        'luxury': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'pink-glow': '0 0 20px rgba(236, 72, 153, 0.3)',
        'purple-glow': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
    },
  },
  plugins: [],
  
  // Ensure these core plugins are enabled
  corePlugins: {
    backdropBlur: true,
    backdropFilter: true,
  },
}