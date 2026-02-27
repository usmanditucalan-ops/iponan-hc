export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B8CFF', // Healthcare Blue
          hover: '#4A7BE6',   // Darker Blue
          light: '#EEF2FF',   // Light Blue
        },
        accent: {
          DEFAULT: '#8B5CF6', // Purple
          hover: '#7C3AED',   // Darker Purple
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F7FF', // Light Blue BG
          tertiary: '#EEF2FF',  // Lighter Blue BG
        },
        text: {
          primary: '#1F2937',   // Dark Gray
          secondary: '#6B7280', // Medium Gray
          muted: '#9CA3AF',     // Light Gray
          'muted-dark': '#6B7280', // Medium Gray (higher contrast)
        },
        border: '#E5E7EB',      // Light Border
        // Status & Feedback Colors
        success: {
          light: '#D1F4E0',     // Light success background
          DEFAULT: '#10B981',   // Standard success
          dark: '#047857',      // Dark success
        },
        warning: {
          light: '#FEF3C7',     // Light warning background
          DEFAULT: '#F59E0B',   // Standard warning
          dark: '#D97706',      // Dark warning
        },
        error: {
          light: '#FEE2E2',     // Light error background
          DEFAULT: '#EF4444',   // Standard error
          dark: '#DC2626',      // Dark error
        },
        info: {
          light: '#DBEAFE',     // Light info background
          DEFAULT: '#3B82F6',   // Standard info
          dark: '#1D4ED8',      // Dark info
        },
        // Dark Mode Colors
        dark: {
          'surface-primary': '#0F172A',    // Deep navy - main background
          'surface-secondary': '#1E293B',  // Slightly lighter navy - cards/panels
          'surface-tertiary': '#334155',   // Medium slate - hover states
          'text-primary': '#F1F5F9',       // Nearly white
          'text-secondary': '#CBD5E1',     // Light gray
          'text-muted-dark': '#94A3B8',    // Medium gray
          'primary': '#60A5FA',            // Lighter blue
          'accent': '#A78BFA',             // Lighter purple
          'border': '#475569',             // Darker border
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Shadow Depth Variants
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(91, 140, 255, 0.1)',
        'lg': '0 10px 15px -3px rgba(91, 140, 255, 0.15)',
        'xl': '0 20px 25px -5px rgba(91, 140, 255, 0.2)',
        'primary': '0 10px 20px -5px rgba(91, 140, 255, 0.3)',
        'elevation': '0 12px 35px -8px rgba(0, 0, 0, 0.08)',
      },
      backgroundColor: {
        'page': '#F5F7FF',
        'gradient-primary': 'linear-gradient(135deg, #5B8CFF 0%, #8B5CF6 100%)',
      },

      // Transition Utilities
      transitionProperty: {
        'default': 'background-color, border-color, color, fill, stroke',
        'all': 'all',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Gradient Backgrounds
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B8CFF 0%, #8B5CF6 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #4A7BE6 0%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
}

