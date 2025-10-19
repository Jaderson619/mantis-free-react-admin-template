import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from 'theme/ThemeProvider';
import MainCard from 'components/MainCard';

/**
 * Página de exemplo para configurações de tema
 * Demonstra como usar o sistema de temas personalizado
 */
export default function ThemeSettings() {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  const handleThemeChange = (event) => {
    const newMode = event.target.value;
    if (newMode !== mode) {
      toggleTheme();
    }
  };

  // Paleta de cores para demonstração
  const colorPalettes = [
    { name: 'Primary', colors: theme.palette.primary },
    { name: 'Secondary', colors: theme.palette.secondary },
    { name: 'Success', colors: theme.palette.success },
    { name: 'Error', colors: theme.palette.error },
    { name: 'Warning', colors: theme.palette.warning },
    { name: 'Info', colors: theme.palette.info }
  ];

  return (
    <Grid container spacing={3}>
      {/* Seletor de Tema */}
      <Grid item xs={12} md={6}>
        <MainCard title="Tema da Aplicação">
          <FormControl component="fieldset">
            <RadioGroup value={mode} onChange={handleThemeChange}>
              <FormControlLabel value="light" control={<Radio />} label="☀️ Tema Claro" />
              <FormControlLabel value="dark" control={<Radio />} label="🌙 Tema Escuro" />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            O tema atual é: <strong>{mode === 'light' ? 'Claro' : 'Escuro'}</strong>
          </Typography>
        </MainCard>
      </Grid>

      {/* Informações do Tema */}
      <Grid item xs={12} md={6}>
        <MainCard title="Informações do Sistema">
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Framework UI
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Material-UI v5
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Licença
              </Typography>
              <Chip label="MIT - Uso Comercial Permitido" color="success" size="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tema
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                100% Customizado
              </Typography>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Paleta de Cores */}
      <Grid item xs={12}>
        <MainCard title="Paleta de Cores do Tema">
          <Grid container spacing={2}>
            {colorPalettes.map((palette) => (
              <Grid item xs={12} sm={6} md={4} key={palette.name}>
                <Card variant="outlined">
                  <CardHeader
                    title={palette.name}
                    titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }}
                  />
                  <CardContent>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: palette.colors.lighter,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                        title="Lighter"
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: palette.colors.light,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                        title="Light"
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: palette.colors.main,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                        title="Main"
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: palette.colors.dark,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                        title="Dark"
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: palette.colors.darker,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                        title="Darker"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </Grid>

      {/* Tipografia */}
      <Grid item xs={12}>
        <MainCard title="Escala de Tipografia">
          <Stack spacing={2}>
            <Typography variant="h1">H1 - Heading 1</Typography>
            <Typography variant="h2">H2 - Heading 2</Typography>
            <Typography variant="h3">H3 - Heading 3</Typography>
            <Typography variant="h4">H4 - Heading 4</Typography>
            <Typography variant="h5">H5 - Heading 5</Typography>
            <Typography variant="h6">H6 - Heading 6</Typography>
            <Typography variant="subtitle1">Subtitle 1</Typography>
            <Typography variant="subtitle2">Subtitle 2</Typography>
            <Typography variant="body1">Body 1 - Texto padrão do corpo</Typography>
            <Typography variant="body2">Body 2 - Texto secundário do corpo</Typography>
            <Typography variant="caption">Caption - Texto pequeno</Typography>
            <Typography variant="overline">OVERLINE TEXT</Typography>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
