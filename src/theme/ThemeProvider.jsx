import React, { useMemo, useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCustomTheme from './index';

// Context para controle do tema
const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {}
});

// Hook para usar o contexto do tema
export const useThemeMode = () => useContext(ThemeContext);

// Provider de tema customizado
export default function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createCustomTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

CustomThemeProvider.propTypes = {
  children: PropTypes.node
};
