import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';

// third-party
import ReactApexChart from 'react-apexcharts';

// ==============================|| INCOME AREA CHART ||============================== //

export default function IncomeAreaChart({ period, includeFrete, salesData, activeMetricsList }) {
  const theme = useTheme();
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;
  const primaryMain = theme.palette.primary.main;
  const success = theme.palette.success.main;
  
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    salesCount: [],
    revenue: []
  });

  // Process sales data when it changes
  useEffect(() => {
    if (!salesData || !Array.isArray(salesData)) {
      console.log('⚠️ [IncomeAreaChart] salesData inválido:', salesData);
      return;
    }

    console.log('📊 [IncomeAreaChart] Processando salesData:', salesData);

    // O backend reescreveu o array, a data agora se chama "date" no formato de data real ou string DD/MM.
    const labels = salesData.map(item => item.date || item.periodLabel || item.period || item._id || 'Sem Data');
    setChartData({
      labels,
      sales: salesData.map(item => item.sales || item.salesCount || item.totalQuantity || 0),
      revenue: salesData.map(item => item.revenue || item.totalRevenue || 0),
      grossRevenue: salesData.map(item => item.vendasBrutas || item.grossRevenue || item.revenue || 0),
      avgPrice: salesData.map(item => item.precoMedio || item.avgPrice || (item.revenue && item.sales ? item.revenue/item.sales : 0)),
      uniqueViews: salesData.map(item => item.visitasUnicas || item.uniqueViews || item.views || 0),
      views: salesData.map(item => item.totalVisitas || item.views || 0),
      uniqueBuyers: salesData.map(item => item.compradoresUnicos || item.uniqueBuyers || item.sales || 0),
      conversion: salesData.map(item => item.conversao || item.conversionRate || item.conversion || 0),
      grossSalesCount: salesData.map(item => item.qtdVendasBrutas || item.grossSalesCount || item.sales || 0)
    });
  }, [salesData]);

  // Obtenha as configurações do gráfico baseado no período
  const getChartTitle = () => {
    switch (period) {
      case 'today':
        return 'Vendas por hora';
      case 'week':
        return 'Vendas por dia desta semana';
      case 'month':
        return 'Vendas por dia deste mês';
      case 'month-weekly':
        return 'Vendas por semana deste mês';
      case 'year':
        return 'Vendas por mês deste ano';
      case 'all-time':
        return 'Vendas anuais';
      default:
        return 'Vendas por período';
    }
  };

  // Format X-axis labels based on period
  const getXAxisFormat = () => {
    switch (period) {
      case 'today':
        return { format: 'HH:mm', tooltip: 'HH:mm' };
      case 'week':
      case 'month':
        return { format: 'DD/MM', tooltip: 'DD/MM' };
      case 'month-weekly':
        return { format: 'Sem W', tooltip: 'Semana W' };
      case 'year':
        return { format: 'MMM', tooltip: 'MMMM' };
      case 'all-time':
        return { format: 'YYYY', tooltip: 'YYYY' };
      default:
        return { format: '', tooltip: '' };
    }
  };

const ALL_METRICS = {
    unidadesVendidas: { name: 'Unidades vendidas', type: 'line', dataKey: 'sales', isCurrency: false },
    vendasConcluidas: { name: 'Vendas concluídas', type: 'line', dataKey: 'revenue', isCurrency: true },
    vendasBrutas: { name: 'Vendas brutas', type: 'line', dataKey: 'grossRevenue', isCurrency: true },
    precoMedio: { name: 'Preço médio', type: 'line', dataKey: 'avgPrice', isCurrency: true },
    visitasUnicas: { name: 'Visitas únicas', type: 'line', dataKey: 'uniqueViews', isCurrency: false },
    totalVisitas: { name: 'Total de visitas', type: 'line', dataKey: 'views', isCurrency: false },
    compradoresUnicos: { name: 'Compradores únicos', type: 'line', dataKey: 'uniqueBuyers', isCurrency: false },
    conversao: { name: 'Conversão (%)', type: 'line', dataKey: 'conversion', isCurrency: false },
    qtdVendasBrutas: { name: 'Quantidade de vendas', type: 'line', dataKey: 'grossSalesCount', isCurrency: false }
  };
  
  let activeSeriesConfigs = [];
  if (activeMetricsList && activeMetricsList.length > 0) {
    activeSeriesConfigs = activeMetricsList.map(id => ALL_METRICS[id]).filter(Boolean);
  } else {
    activeSeriesConfigs = [
      { name: 'Número de Vendas', type: 'column', dataKey: 'sales', isCurrency: false },
      { name: 'Receita', type: 'line', dataKey: 'revenue', isCurrency: true }
    ];
  }

  const series = activeSeriesConfigs.map((config) => ({
    name: config.name,
    type: config.type,
    data: chartData[config.dataKey] || []
  }));

  const dynamicColors = [
    primaryMain, success, theme.palette.warning.main, theme.palette.error.main, 
    theme.palette.info.main, theme.palette.secondary.main, '#8e44ad', '#00b894', '#d35400'
  ];

  // Chart options
  const options = {
    chart: {
      type: 'line',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: [0, 3]
    },
    fill: {
      type: ['solid', 'solid'],
      opacity: [0.85, 1]
    },
    colors: activeSeriesConfigs.map((_, i) => dynamicColors[i % dynamicColors.length]),
    labels: chartData.labels,
    xaxis: {
      type: 'category',
      categories: chartData.labels,
      labels: {
        style: {
          colors: Array(12).fill(secondary)
        },
        formatter: (value) => {
          // Formatação específica baseada no período
          // Formatar data YYYY-MM-DD para DD/MM caso venha assim do Analytics
          if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ano, mes, dia] = value.split('-');
            return `${dia}/${mes}`;
          }
          return value;
        }
      },
      axisBorder: {
        show: true,
        color: line
      }
    },
    yaxis: activeSeriesConfigs.map((config, index) => ({
      show: index <= 1,
      opposite: index === 1,
      labels: {
        style: { colors: [secondary] },
        formatter: (value) => {
          if (!value) return 0;
          if (config.isCurrency) {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return value.toFixed(0);
          }
          if (config.dataKey === 'conversion') return `${value.toFixed(1)}%`;
          return value.toFixed(0);
        }
      }
    })),
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value, { seriesIndex }) => {
          const config = activeSeriesConfigs[seriesIndex];
          if (!config || value == null) return value;
          if (config.isCurrency) return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          if (config.dataKey === 'conversion') return Number(value).toFixed(2) + '%';
          return value;
        }
      },
      x: {
        formatter: (value) => {
          const format = getXAxisFormat();
          // Se o valor já vier como "YYYY-MM-DD" do banco para análise de produto
          if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ano, mes, dia] = value.split('-');
            return `${dia}/${mes}`;
          }
          return value; // Usar formatação específica para o tooltip
        }
      }
    },
    legend: {
      show: false
    },
    grid: {
      borderColor: line
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 3
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Verificar se há dados para exibir
  if (!chartData.labels || chartData.labels.length === 0) {
    return (
      <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Nenhum dado disponível para o período selecionado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tente selecionar um período diferente ou verifique se há vendas aprovadas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <ReactApexChart options={options} series={series} type="line" height={450} />
      
      {/* Tooltips personalizados para vendas destacadas */}
      {period === 'year' && chartData.labels.length > 5 && (
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
            p: 1,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {chartData.sales[5] || 591} Pedidos
          </Typography>
        </Box>
      )}
    </Box>
  );
}

IncomeAreaChart.propTypes = {
  period: PropTypes.string.isRequired,
  includeFrete: PropTypes.bool,
  salesData: PropTypes.array
};
