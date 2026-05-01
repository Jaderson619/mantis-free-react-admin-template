const fs = require('fs');
let chartPath = 'src/pages/dashboard/IncomeAreaChart.jsx';
let code = fs.readFileSync(chartPath, 'utf8');

code = code.replace(
  'export default function IncomeAreaChart({ period, includeFrete, salesData }) {',
  'export default function IncomeAreaChart({ period, includeFrete, salesData, activeMetricsList }) {'
);

const mappingCode = `
    const labels = salesData.map(item => item.date || item.periodLabel || item.period || item._id || 'Sem Data');
    setChartData({
      labels,
      sales: salesData.map(item => item.sales || item.salesCount || item.totalQuantity || 0),
      revenue: salesData.map(item => item.revenue || item.totalRevenue || 0),
      grossRevenue: salesData.map(item => item.grossRevenue || item.vendasBrutas || item.revenue || 0),
      avgPrice: salesData.map(item => item.avgPrice || item.precoMedio || (item.revenue && item.sales ? item.revenue/item.sales : 0)),
      uniqueViews: salesData.map(item => item.uniqueViews || item.visitasUnicas || item.views || 0),
      views: salesData.map(item => item.views || item.totalVisitas || 0),
      uniqueBuyers: salesData.map(item => item.uniqueBuyers || item.compradoresUnicos || item.sales || 0),
      conversion: salesData.map(item => item.conversion || item.conversao || item.conversionRate || 0),
      grossSalesCount: salesData.map(item => item.grossSalesCount || item.qtdVendasBrutas || item.sales || 0)
    });
`;

code = code.replace(
  /const labels = salesData\.map\([\s\S]*?setChartData\(\{\s*labels,\s*salesCount,\s*revenue\s*\}\);/m,
  mappingCode.trim()
);

const allMetricsStr = `
  const ALL_METRICS = {
    unidadesVendidas: { name: 'Unidades vendidas', type: 'line', dataKey: 'sales', isCurrency: false },
    vendasConcluidas: { name: 'Vendas concluídas', type: 'line', dataKey: 'revenue', isCurrency: true },
    vendasBrutas: { name: 'Vendas brutas', type: 'line', dataKey: 'grossRevenue', isCurrency: true },
    precoMedio: { name: 'Preço médio', type: 'line', dataKey: 'avgPrice', isCurrency: true },
    visitasUnicas: { name: 'Visitas únicas', type: 'line', dataKey: 'uniqueViews', isCurrency: false },
    totalVisitas: { name: 'Total de visitas', type: 'line', dataKey: 'views', isCurrency: false },
    compradoresUnicos: { name: 'Compradores únicos', type: 'line', dataKey: 'uniqueBuyers', isCurrency: false },
    conversao: { name: 'Conversão', type: 'line', dataKey: 'conversion', isCurrency: false },
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
`;

code = code.replace(
  /\/\/ Chart series data\s*const series = \[\s*\{\s*name: 'Número de Vendas'[\s\S]*?\];/m,
  allMetricsStr.trim()
);

code = code.replace(
  /colors: \[primaryMain, success\],/g,
  'colors: activeSeriesConfigs.map((_, i) => dynamicColors[i % dynamicColors.length]),'
);

const yaxisCode = `
    yaxis: activeSeriesConfigs.map((config, index) => ({
      show: index <= 1,
      opposite: index === 1,
      title: { text: config.name, style: { color: secondary } },
      labels: {
        style: { colors: [secondary] },
        formatter: (value) => {
          if (!value) return 0;
          if (config.isCurrency) {
            if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
            return value.toFixed(0);
          }
          if (config.dataKey === 'conversion') return value.toFixed(1) + '%';
          return value.toFixed(0);
        }
      }
    })),
`;

code = code.replace(
  /yaxis: \[[\s\S]*?\]\s*(,\s*)?(?=tooltip:)/m,
  yaxisCode.trim() + ',\n    '
);

const tooltipYCode = `
      y: {
        formatter: (value, { seriesIndex }) => {
          const config = activeSeriesConfigs[seriesIndex];
          if (!config || value == null) return value;
          if (config.isCurrency) return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          if (config.dataKey === 'conversion') return Number(value).toFixed(2) + '%';
          return value;
        }
      },
`;

code = code.replace(
  /y: \{\s*formatter: \(value, \{ seriesIndex \}\) => \{[\s\S]*?\},/m,
  tooltipYCode.trim() + ','
);

code = code.replace(
  /chartData\.salesCount/g,
  'chartData.sales'
);

fs.writeFileSync(chartPath, code);
console.log('chart updated');
