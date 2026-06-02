import { createTheme } from '@mui/material/styles'

// ComfyUI-style dark theme colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a9eff', // Accent blue for ports/highlights
      light: '#6bb3ff',
      dark: '#2d7fd9',
    },
    secondary: {
      main: '#22c55e', // Green for success states
      light: '#4ade80',
      dark: '#16a34a',
    },
    background: {
      default: '#0d0d1a', // Canvas background
      paper: '#1a1a2e',   // Card/panel background
    },
    text: {
      primary: '#ffffff',
      secondary: '#8b8b9a',
    },
    divider: '#2d2d44',
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1rem', fontWeight: 600 },
    h5: { fontSize: '0.875rem', fontWeight: 600 },
    h6: { fontSize: '0.75rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.688rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#252540',
          borderRadius: 6,
          '&:hover': {
            backgroundColor: '#2d2d55',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#252540',
          '&:hover': {
            backgroundColor: '#2d2d55',
          },
          '&.Mui-focused': {
            backgroundColor: '#2d2d55',
          },
        },
        notchedOutline: {
          borderColor: '#2d2d44',
        },
      },
    },
  },
})

export default theme

// Export CSS variables for easy access in CSS
export const darkThemeColors = {
  bgPrimary: '#0d0d1a',      // Canvas background
  bgSecondary: '#1a1a2e',    // Card/panel background
  bgTertiary: '#252540',      // Hover background
  border: '#2d2d44',         // Border
  textPrimary: '#ffffff',      // Primary text
  textSecondary: '#8b8b9a',   // Secondary text
  accentBlue: '#4a9eff',      // Blue accent (ports/highlight)
  accentGreen: '#22c55e',     // Green (success)
  accentYellow: '#f59e0b',    // Yellow (warning)
  accentRed: '#ef4444',       // Red (error)
} as const
