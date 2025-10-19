import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode } from 'theme/ThemeProvider';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

/**
 * Botão para alternar entre tema claro e escuro
 * Use em qualquer lugar do app (ex: Header, Settings)
 */
export default function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}>
      <IconButton 
        onClick={toggleTheme} 
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        {mode === 'light' ? <BulbOutlined /> : <BulbFilled />}
      </IconButton>
    </Tooltip>
  );
}
