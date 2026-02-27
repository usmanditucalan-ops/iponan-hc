/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: We must keep the content paths specific to the mobile project structure
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  // presets: [require("nativewind/preset")], // NativeWind v2 does not use this preset
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B8CFF', // Healthcare Blue
          hover: '#4A7BE6',
          light: '#EEF2FF',
        },
        accent: {
          DEFAULT: '#8B5CF6', // Purple
          hover: '#7C3AED',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F7FF',
          tertiary: '#EEF2FF',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          'muted-dark': '#6B7280',
        },
        border: '#E5E7EB',
        success: { light: '#D1F4E0', DEFAULT: '#10B981', dark: '#047857' },
        warning: { light: '#FEF3C7', DEFAULT: '#F59E0B', dark: '#D97706' },
        error: { light: '#FEE2E2', DEFAULT: '#EF4444', dark: '#DC2626' },
        info: { light: '#DBEAFE', DEFAULT: '#3B82F6', dark: '#1D4ED8' },
        
        // Dark Mode Mappings
        'dark-bg': '#0F172A',
        'dark-surface-primary': '#0F172A',
        'dark-surface-secondary': '#1E293B',
        'dark-surface-tertiary': '#334155',
        'dark-text': '#F1F5F9',
        'dark-text-secondary': '#CBD5E1',
        'dark-text-muted': '#94A3B8',
        'dark-border': '#475569',
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        medium: ['Inter-Medium'],
        bold: ['Inter-Bold'],
        extrabold: ['Inter-ExtraBold'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(91, 140, 255, 0.1)',
        'lg': '0 10px 15px rgba(91, 140, 255, 0.15)',
        'xl': '0 20px 25px rgba(91, 140, 255, 0.2)',
        'primary': '0 10px 20px rgba(91, 140, 255, 0.3)',
        'elevation': '0 12px 35px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
