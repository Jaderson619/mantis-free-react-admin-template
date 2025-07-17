import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';

// third-party
import ReactApexChart from 'react-apexcharts';

// ==============================|| INCOME AREA CHART ||============================== //

export default function IncomeAreaChart({ period, includeFrete, salesData }) {
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
      return;
    }

    // Extrair labels, contagem de vendas e receita do salesData
    const labels = salesData.map(item => item.period);
    const salesCount = salesData.map(item => item.salesCount);
    const revenue = salesData.map(item => item.revenue);

    setChartData({
      labels,
      salesCount,
      revenue
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
    colors: [primaryMain, success],
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
          return value;
        }
      },
      axisBorder: {
        show: true,
        color: line
      }
    },
    yaxis: [
      {
        title: {
          text: 'Nº Vendas',
          style: {
            color: secondary
          }
        },
        labels: {
          style: {
            colors: [secondary]
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'R$',
          style: {
            color: secondary
          }
        },
        labels: {
          style: {
            colors: [secondary]
          },
          formatter: (value) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          }
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 0) {
            return `${value} pedidos`;
          }
          return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
      },
      x: {
        formatter: (value) => {
          const format = getXAxisFormat();
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

  // Chart series data
  const series = [
    {
      name: 'Número de Vendas',
      type: 'column',
      data: chartData.salesCount
    },
    {
      name: 'Receita',
      type: 'line',
      data: chartData.revenue
    }
  ];

  if (loading) {
    return (
      <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
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
            {chartData.salesCount[5] || 591} Pedidos
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
