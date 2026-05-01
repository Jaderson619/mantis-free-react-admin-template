import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Autocomplete,
  TextField,
  CircularProgress,
  Button
} from '@mui/material';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import IncomeAreaChart from 'pages/dashboard/IncomeAreaChart';
import ScenarioSimulator from './ScenarioSimulator';
import axios from 'axios';

// Icons
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';

export default function ProductAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const skuParam = searchParams.get('sku');

  const [period, setPeriod] = useState('30d'); // 7d, 15d, 30d, 1y

  // Seleção de Produto
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [productData, setProductData] = useState(null);

  // States de Métricas (Mock Inicial até a API ficar ponta)
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState({
    vendasBrutas: 0,
    vendasConcluidas: 0,
    unidadesVendidas: 0,
    precoMedio: 0,
    visitasUnicas: 0,
    totalVisitas: 0,
    compradoresUnicos: 0,
    conversao: 0,
    qtdVendasBrutas: 0,
    currentStock: 0,
    stockCoverageDays: 0
  });
  
  const [simulationParams, setSimulationParams] = useState(null);

  const [activeMetrics, setActiveMetrics] = useState(['vendasConcluidas', 'unidadesVendidas']);

  const toggleMetric = (id) => {
    setActiveMetrics(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };

  const METRIC_CARDS = [
    { id: 'vendasBrutas', title: 'Vendas brutas', isCurrency: true },
    { id: 'vendasConcluidas', title: 'Vendas concluídas', isCurrency: true },
    { id: 'unidadesVendidas', title: 'Unidades vendidas', isCurrency: false },
    { id: 'precoMedio', title: 'Preço médio por unidade', isCurrency: true },
    { id: 'visitasUnicas', title: 'Visitas únicas', isCurrency: false },
    { id: 'totalVisitas', title: 'Total de visitas', isCurrency: false },
    { id: 'compradoresUnicos', title: 'Compradores únicos', isCurrency: false },
    { id: 'conversao', title: 'Conversão', isPercentage: true },
    { id: 'qtdVendasBrutas', title: 'Quantidade de vendas brutas', isCurrency: false }
  ];

  const formatCardValue = (card, val) => {
    if (!val && val !== 0) return '0';
    if (card.isCurrency) return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (card.isPercentage) return Number(val).toFixed(1) + '%';
    return Number(val).toString();
  };
  
  // States do Gráfico
  const [chartData, setChartData] = useState([]); // Formato: [{ date: '...', visits: 0, sales: 0 }]

  // 1. Busca do Autocomplete
  useEffect(() => {
    if (!searchInputValue) {
      setSearchOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
        let response;
        try {
          response = await axios.get('http://localhost:5001/api/products', {
            params: { search: searchInputValue, limit: 10 },
            headers
          });
        } catch (e) {
          response = await axios.get('http://localhost:5001/api/products/db', {
            params: { search: searchInputValue, limit: 10 },
            headers
          });
        }
        const rawData = response.data?.data || response.data;
        if (rawData) {
          const items = Array.isArray(rawData) ? rawData : rawData.items || [];
          setSearchOptions(items);
        }
      } catch (err) {
        console.error('Erro na busca de produtos:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // 2. Resolve o Produto Selecionado pela URL
  useEffect(() => {
    if (skuParam) {
      const fetchInitialProduct = async () => {
        try {
          const auth = JSON.parse(localStorage.getItem('auth') || '{}');
          const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
          let response;
          try {
            response = await axios.get(`http://localhost:5001/api/products/${encodeURIComponent(skuParam)}`, { headers });
          } catch (e) {
            response = await axios.get(`http://localhost:5001/api/products/db/${encodeURIComponent(skuParam)}`, { headers });
          }
          const data = response.data?.data || response.data;
          if (data) setProductData(data);
        } catch (err) {
          console.error('Erro ao buscar produto do SKU na URL', err);
        }
      };
      // Executa apenas se não tiver carregado ainda (evita loop)
      if (!productData || productData.sku !== skuParam) {
        fetchInitialProduct();
      }
    }
  }, [skuParam]);

  // 3. Busca das Métricas do Produto (Backend Mock / Expected)
  useEffect(() => {
    if (!productData) return;

    const fetchAnalytics = async () => {
      setLoadingMetrics(true);
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

        try {
          const res = await axios.get(`http://localhost:5001/api/products/${encodeURIComponent(productData.sku)}/analytics`, {
            params: { period },
            headers
          });

          // Conforme api criada pelo backend: totalSales, totalRevenue, conversionRate, chartData, stockCoverageDays, views
          const endpointData = res.data?.data || res.data;

          if (endpointData) {
              const metricsObj = endpointData.metrics || {};
              console.log('📦 Payload recebido da API:', metricsObj);
              
              setMetrics({
                vendasBrutas: metricsObj.vendasBrutas || metricsObj.grossRevenue || metricsObj.totalRevenue || 0,
                vendasConcluidas: metricsObj.vendasConcluidas || metricsObj.completedSales || metricsObj.totalRevenue || 0,
                unidadesVendidas: metricsObj.unidadesVendidas || metricsObj.soldUnits || metricsObj.totalQuantity || metricsObj.totalSales || 0,
                precoMedio: metricsObj.precoMedio || metricsObj.avgPrice || (metricsObj.totalSales ? (metricsObj.totalRevenue / metricsObj.totalSales) : 0),
                
                // Mapeamento extra abrangente para visitas
                visitasUnicas: metricsObj.visitasUnicas || metricsObj.uniqueViews || metricsObj.uniqueVisits || metricsObj.visitas_unicas || 0,
                totalVisitas: metricsObj.totalVisitas || metricsObj.totalViews || metricsObj.totalVisits || metricsObj.visitas_totais || endpointData.views || metricsObj.views || 0,
                
                compradoresUnicos: metricsObj.compradoresUnicos || metricsObj.uniqueBuyers || metricsObj.totalSales || 0,
                conversao: metricsObj.conversao || metricsObj.conversionRate || 0,
                qtdVendasBrutas: metricsObj.qtdVendasBrutas || metricsObj.grossSalesCount || metricsObj.totalSales || 0,
                currentStock: metricsObj.currentStock || 0,
                stockCoverageDays: metricsObj.stockCoverageDays || 0
              });
            
            // Garantir que repassamos os dados reais do gráfico
            setChartData(endpointData.chartData || []);
            setSimulationParams(endpointData.simulationParams || null);
          }
        } catch (e) {
          console.error('Erro na requisição Analytics', e);
          setMetrics({ vendasBrutas: 0, vendasConcluidas: 0, unidadesVendidas: 0, precoMedio: 0, visitasUnicas: 0, totalVisitas: 0, compradoresUnicos: 0, conversao: 0, qtdVendasBrutas: 0, currentStock: 0, stockCoverageDays: 0 });
          setChartData([]);
          setSimulationParams(null);
        }
      } catch (err) {
        console.error('Erro geral no useEffect de Analytics', err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchAnalytics();
  }, [productData, period]);


  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Análise de Desempenho do Produto</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarOutlined style={{ color: '#8c8c8c' }} />
            <Button size="small" variant={period === '7d' ? 'contained' : 'outlined'} onClick={() => setPeriod('7d')}>7 Dias</Button>
            <Button size="small" variant={period === '15d' ? 'contained' : 'outlined'} onClick={() => setPeriod('15d')}>15 Dias</Button>
            <Button size="small" variant={period === '30d' ? 'contained' : 'outlined'} onClick={() => setPeriod('30d')}>30 Dias</Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <MainCard sx={{ mb: 2 }}>
          <Autocomplete
            options={searchOptions}
            getOptionLabel={(option) => `${option.sku} - ${option.name}`}
            filterOptions={(x) => x}
            loading={loadingSearch}
            value={productData || null}
            isOptionEqualToValue={(option, value) => option.sku === value.sku}
            onInputChange={(e, newInputValue) => setSearchInputValue(newInputValue)}
            onChange={(e, newValue) => {
              if (newValue) {
                setSearchParams({ sku: newValue.sku });
              } else {
                setSearchParams({});
                setProductData(null);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Busque e altere o produto que deseja analisar"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSearch ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
          {productData && (
            <Typography variant="subtitle1" color="primary.main" sx={{ mt: 2 }}>
               Em Análise: <strong>{productData.sku} - {productData.name}</strong>
            </Typography>
          )}
        </MainCard>
      </Grid>

      
        {/* MÉTRICAS (CARDS) */}
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Indicadores Gerais</Typography>
          <Typography variant="body2" color="textSecondary">Clique nos cards para exibir os dados no gráfico abaixo.</Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {METRIC_CARDS.map(card => {
              const isActive = activeMetrics.includes(card.id);
              return (
                <Grid item xs={12} sm={6} md={3} key={card.id}>
                  <Box 
                    onClick={() => toggleMetric(card.id)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: isActive ? 1 : 0.5,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': { opacity: 1 },
                      height: '100%',
                      '& > div': { height: '100%' }
                    }}
                  >
                    <AnalyticEcommerce
                      title={card.title}
                      count={formatCardValue(card, metrics[card.id] || 0)}
                      color={isActive ? 'primary' : 'inherit'}
                      extra="Ver no gráfico"
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* GRÁFICO DE VENDAS HISTÓRico */}
      <Grid item xs={12}>
        <MainCard title="Desempenho Geral / Oportunidade">
          <Box sx={{ pt: 1, pr: 2 }}>
             {loadingMetrics ? (
                <Stack alignItems="center" my={5}><CircularProgress /></Stack>
             ) : (
                <IncomeAreaChart period={period} includeFrete={false} salesData={chartData} activeMetricsList={activeMetrics} />
             )}
          </Box>
        </MainCard>
      </Grid>
      
      {/* SIMULADOR DE CENÁRIOS */}
      {simulationParams && (
        <Grid item xs={12}>
          <ScenarioSimulator currentData={simulationParams} />
        </Grid>
      )}
    </Grid>
  );
}
