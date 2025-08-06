import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFD700', // Gold
      light: '#FFED4A',
      dark: '#F59E0B',
      contrastText: '#000000',
    },
    secondary: {
      main: '#000000', // Black
      light: '#1F2937',
      dark: '#000000',
      contrastText: '#FFD700',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#F8F8F8',
      secondary: '#B0B0B0',
    },
    gold: {
      main: '#FFD700',
      light: '#FFED4A',
      dark: '#F59E0B',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '0.9rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.8rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          backgroundColor: '#FFD700',
          color: '#0A0A0A',
          border: '2px solid #FFD700',
          '&:hover': {
            backgroundColor: '#FFED4A',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
          },
        },
        outlined: {
          borderColor: '#FFD700',
          color: '#FFD700',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#FFED4A',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          borderRadius: 16,
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(255, 215, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(255, 215, 0, 0.2)',
            borderColor: 'rgba(255, 215, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1A1A1A',
            color: '#F8F8F8',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(248, 248, 248, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFD700',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFD700',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B0B0B0',
            '&.Mui-focused': {
              color: '#FFD700',
            },
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: '#FFD700',
        },
        iconHover: {
          color: '#FFED4A',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFD700',
          color: '#000000',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#FFED4A',
          },
        },
      },
    },
  },
});

export default theme;