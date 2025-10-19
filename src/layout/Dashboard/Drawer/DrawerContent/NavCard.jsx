// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

// ==============================|| DRAWER CONTENT - HELP CARD ||============================== //

export default function NavCard() {
  const theme = useTheme();
  
  return (
    <MainCard sx={{ bgcolor: theme.palette.primary.lighter, m: 3 }}>
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}
        >
          💡
        </Box>
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h6" fontWeight={600}>
            Precisa de Ajuda?
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Consulte a documentação ou entre em contato com o suporte
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}
