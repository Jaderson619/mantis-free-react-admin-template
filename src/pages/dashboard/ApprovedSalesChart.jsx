import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';

// project import
import MainCard from 'components/MainCard';
import IncomeAreaChart from './IncomeAreaChart';

// ==============================|| GRÁFICO DE VENDAS APROVADAS ||============================== //

export default function ApprovedSalesChart() {
  // Desvinculado do filtro principal - cria seu próprio período
  const [period, setPeriod] = useState('year');
  const [includeFrete, setIncludeFrete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    salesByPeriod: []
  });
  
  // Determina título baseado no período selecionado
  const getPeriodTitle = () => {
    switch (period) {
      case 'today':
        return 'Suas Vendas Aprovadas hoje';
      case 'week':
        return 'Suas Vendas Aprovadas esta semana';
      case 'month':
        return 'Suas Vendas Aprovadas este mês';
      case 'month-weekly':
        return 'Suas Vendas Aprovadas este mês (semanal)';
      case 'year':
        return 'Suas Vendas Aprovadas este ano';
      case 'all-time':
        return 'Suas Vendas Aprovadas (período total)';
      default:
        return 'Suas Vendas Aprovadas';
    }
  };

  // Calcula datas de início e fim com base no período
  const calculateDateRange = (periodType) => {
    const now = dayjs();
    let startDate, endDate;

    switch (periodType) {
      case 'today':
        startDate = now.startOf('day');
        endDate = now.endOf('day');
        break;
      case 'week':
        // Esta semana - mostra vendas por dia
        startDate = now.startOf('week');
        endDate = now.endOf('week');
        break;
      case 'month':
        // Este mês - mostra vendas por dia
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        break;
      case 'month-weekly':
        // Este mês (semanal) - mostra vendas agrupadas por semana
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        break;
      case 'year':
        // Este ano - mostra vendas por mês
        startDate = now.startOf('year');
        endDate = now.endOf('year');
        break;
      case 'all-time':
        // Período total - mostra vendas por ano
        startDate = dayjs('2020-01-01'); // Data inicial arbitrária
        endDate = now;
        break;
      default:
        startDate = now.startOf('year');
        endDate = now.endOf('year');
    }

    // Formata as datas como strings fixas para evitar problemas de timezone
    return {
      startDate: startDate.format('YYYY-MM-DDT00:00:00'),
      endDate: endDate.format('YYYY-MM-DDT23:59:59')
    };
  };

  // Fetch sales data from API com período independente
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // Calcula o intervalo de datas baseado no período
        const dateRange = calculateDateRange(period);
        
        // Define o tipo de agrupamento baseado no período
        let groupBy;
        switch(period) {
          case 'today':
            groupBy = 'hour';
            break;
          case 'week':
            groupBy = 'day'; // Agrupa por dia dentro da semana
            break;
          case 'month':
            groupBy = 'day'; // Agrupa por dia dentro do mês
            break;
          case 'month-weekly':
            groupBy = 'week'; // Agrupa por semana dentro do mês
            break;
          case 'year':
            groupBy = 'month'; // Agrupa por mês dentro do ano
            break;
          case 'all-time':
            groupBy = 'year'; // Agrupa por ano
            break;
          default:
            groupBy = 'month';
        }
        
        // Cria parâmetros com datas calculadas e tipo de agrupamento
        const params = {
          ...dateRange,
          period,       // Período selecionado (today, week, month, etc)
          groupBy,      // Tipo de agrupamento (hour, day, week, month, year)
          includeFrete
        };
        
        console.log('🔍 [ApprovedSalesChart] Buscando dados de vendas:', {
          period,
          dateRange,
          groupBy,
          includeFrete,
          url: 'http://localhost:5001/api/orders/sales-by-period',
          params
        });
        
        const response = await axios.get('http://localhost:5001/api/orders/sales-by-period', { params });
        
        console.log('📦 [ApprovedSalesChart] Resposta da API:', response.data);
        console.log('📦 [ApprovedSalesChart] salesByPeriod array:', response.data.salesByPeriod);
        console.log('📦 [ApprovedSalesChart] Primeiro item:', response.data.salesByPeriod?.[0]);
        
        const salesData = {
          totalSales: response.data.totalSales || 0,
          totalRevenue: response.data.totalRevenue || 0,
          salesByPeriod: response.data.salesByPeriod || []
        };
        
        console.log('✅ [ApprovedSalesChart] Dados processados:', salesData);
        console.log('✅ [ApprovedSalesChart] Número de períodos:', salesData.salesByPeriod.length);
        
        setSalesData(salesData);
      } catch (error) {
        console.error('❌ [ApprovedSalesChart] Erro ao buscar dados de vendas:', error);
        console.error('📋 [ApprovedSalesChart] Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          params: error.config?.params
        });
        
        // Define dados vazios em caso de erro
        setSalesData({
          totalSales: 0,
          totalRevenue: 0,
          salesByPeriod: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [period, includeFrete]);

  // Formatar valor da receita
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
        <Grid item>
          <Typography variant="h5">{getPeriodTitle()}</Typography>
        </Grid>
        <Grid item>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="period-label">Período</InputLabel>
              <Select
                labelId="period-label"
                value={period}
                label="Período"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="today">Hoje (por hora)</MenuItem>
                <MenuItem value="week">Esta semana (por dia)</MenuItem>
                <MenuItem value="month">Este mês (por dia)</MenuItem>
                <MenuItem value="month-weekly">Este mês (por semana)</MenuItem>
                <MenuItem value="year">Este ano (por mês)</MenuItem>
                <MenuItem value="all-time">Período total (por ano)</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              size="small"
            >
              Ver Financeiro MP
            </Button>
          </Stack>
        </Grid>
      </Grid>
      
      <FormControlLabel 
        control={
          <Checkbox 
            checked={includeFrete} 
            onChange={(e) => setIncludeFrete(e.target.checked)} 
          />
        } 
        label="Incluir frete comprador" 
        sx={{ mt: 1 }}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="text.secondary">
                Vendas aprovadas
              </Typography>
              <Typography variant="h3">
                {salesData.totalSales.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="text.secondary">
                Receita
              </Typography>
              <Typography variant="h3">
                {formatCurrency(salesData.totalRevenue)}
              </Typography>
            </Grid>
          </Grid>
          
          <MainCard content={false} sx={{ mt: 1.5 }}>
            <Box sx={{ pt: 1, pr: 2, pb: 1, pl: 2 }}>
              <IncomeAreaChart 
                period={period}
                includeFrete={includeFrete}
                salesData={salesData.salesByPeriod}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                * Este gráfico não leva em consideração suas vendas CANCELADAS
              </Typography>
            </Box>
          </MainCard>
        </>
      )}
    </>
  );
}
