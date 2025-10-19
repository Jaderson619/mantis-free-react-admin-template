import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

// Paleta de cores customizada
const colors = {
  primary: {
    lighter: '#E3F2FD',
    light: '#90CAF9',
    main: '#1976D2',
    dark: '#1565C0',
    darker: '#0D47A1',
    contrastText: '#ffffff'
  },
  secondary: {
    lighter: '#F3E5F5',
    light: '#CE93D8',
    main: '#9C27B0',
    dark: '#7B1FA2',
    darker: '#4A148C',
    contrastText: '#ffffff'
  },
  success: {
    lighter: '#E8F5E9',
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
    darker: '#1B5E20',
    contrastText: '#ffffff'
  },
  error: {
    lighter: '#FFEBEE',
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
    darker: '#B71C1C',
    contrastText: '#ffffff'
  },
  warning: {
    lighter: '#FFF3E0',
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
    darker: '#E65100',
    contrastText: '#000000'
  },
  info: {
    lighter: '#E1F5FE',
    light: '#4FC3F7',
    main: '#03A9F4',
    dark: '#0288D1',
    darker: '#01579B',
    contrastText: '#ffffff'
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#F5F5F5',
    A200: '#EEEEEE',
    A400: '#BDBDBD',
    A700: '#616161'
  }
};

// Criar tema customizado
export const createCustomTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme(
    {
      palette: {
        mode,
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        grey: colors.grey,
        background: {
          default: isDark ? '#121212' : '#F5F5F5',
          paper: isDark ? '#1E1E1E' : '#FFFFFF'
        },
        text: {
          primary: isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.87)',
          secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        action: {
          active: isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.54)',
          hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
          disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
          disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
        }
      },
      typography: {
        fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
        h1: {
          fontSize: '2.5rem',
          fontWeight: 600,
          lineHeight: 1.2
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.3
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.4
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 500,
          lineHeight: 1.4
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.5
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: 1.6
        },
        subtitle1: {
          fontSize: '1rem',
          fontWeight: 400,
          lineHeight: 1.75
        },
        subtitle2: {
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.57
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.43
        },
        button: {
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none'
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.66
        },
        overline: {
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          lineHeight: 2.66
        }
      },
      shape: {
        borderRadius: 8
      },
      shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.08)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.08)',
        '0px 12px 24px rgba(0,0,0,0.08)',
        '0px 16px 32px rgba(0,0,0,0.08)',
        '0px 20px 40px rgba(0,0,0,0.08)',
        '0px 24px 48px rgba(0,0,0,0.08)',
        ...Array(17).fill('none')
      ],
      customShadows: {
        z1: '0px 2px 8px rgba(0,0,0,0.08)',
        z8: '0px 8px 16px rgba(0,0,0,0.08)',
        z12: '0px 12px 24px rgba(0,0,0,0.08)',
        z16: '0px 16px 32px rgba(0,0,0,0.08)',
        z20: '0px 20px 40px rgba(0,0,0,0.08)',
        z24: '0px 24px 48px rgba(0,0,0,0.08)'
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500
            },
            sizeLarge: {
              padding: '12px 24px',
              fontSize: '1rem'
            },
            sizeMedium: {
              padding: '8px 16px',
              fontSize: '0.875rem'
            },
            sizeSmall: {
              padding: '4px 12px',
              fontSize: '0.8125rem'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
            }
          }
        },
        MuiCardHeader: {
          styleOverrides: {
            root: {
              padding: 20
            }
          }
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: 20,
              '&:last-child': {
                paddingBottom: 20
              }
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8
            }
          }
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none'
            },
            rounded: {
              borderRadius: 12
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
            },
            head: {
              fontWeight: 600,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
            }
          }
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 8
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 12
            }
          }
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRadius: 0
            }
          }
        }
      }
    },
    ptBR // Localização PT-BR
  );
};

export default createCustomTheme;
