const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'polygon-purple': '#8247e5',
        'matic-blue' : '#2bbdf7',
        'btn-silver': '#C0C0C0',
        'btn-gold': '#D4AF37',
        'btn-red': '#f50057',
        'twitter-blue': '#1DA1F2'
      },
      screens: {
        xs: "390px", 
        xs2: "414px",
        xl3: "2000px"      
      },
  
    },
  },
  screens: {
    '2xs': { min: '300px' },
    xs: { max: '575px' }, // Mobile (iPhone 3 - iPhone XS Max).
    sm: { min: '576px', max: '897px' }, // Mobile (matches max: iPhone 11 Pro Max landscape @ 896px).
    md: { min: '898px', max: '1199px' }, // Tablet (matches max: iPad Pro @ 1112px).
    lg: { min: '1200px' }, // Desktop smallest.
    xl: { min: '1259px' }, // Desktop wide.
    '2xl': { min: '1359px' } // Desktop widescreen.
  },
  plugins: [
   
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
          {
              'bg-gradient': (angle) => ({
                  'background-image': `linear-gradient(${angle}, var(--tw-gradient-stops))`,
              }),
          },
          {
              // values from config and defaults you wish to use most
              values: Object.assign(
                  theme('bgGradientDeg', {}), // name of config key. Must be unique
                  {
                      0:  '0deg',
                      10: '10deg', // bg-gradient-10
                      15: '15deg',
                      20: '20deg',
                      25: '25deg',
                      30: '30deg',
                      45: '45deg',
                      60: '60deg',
                      90: '90deg',
                      120: '120deg',
                      135: '135deg',
                  }
              )
          }
       )
    })
  ] 
}
