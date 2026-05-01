const fs = require('fs');

let path = 'src/pages/products/analytics.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add activeMetrics state
const stateCode = `
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
`;

code = code.replace(/const \[metrics, setMetrics\] = useState\(\{[\s\S]*?\}\);/, stateCode.trim());

// 2. Set the metrics object in the try-catch
const metricsSetCode = `
          if (endpointData.metrics) {
            const metricsObj = endpointData.metrics;
            setMetrics({
              vendasBrutas: metricsObj.vendasBrutas || metricsObj.grossRevenue || metricsObj.totalRevenue || 0,
              vendasConcluidas: metricsObj.vendasConcluidas || metricsObj.completedSales || metricsObj.totalRevenue || 0,
              unidadesVendidas: metricsObj.unidadesVendidas || metricsObj.soldUnits || metricsObj.totalSales || 0,
              precoMedio: metricsObj.precoMedio || metricsObj.avgPrice || (metricsObj.totalSales ? metricsObj.totalRevenue / metricsObj.totalSales : 0),
              visitasUnicas: metricsObj.visitasUnicas || metricsObj.uniqueViews || endpointData.views || 0,
              totalVisitas: metricsObj.totalVisitas || metricsObj.totalViews || metricsObj.totalVisits || endpointData.views || 0,
              compradoresUnicos: metricsObj.compradoresUnicos || metricsObj.uniqueBuyers || metricsObj.totalSales || 0,
              conversao: metricsObj.conversao || metricsObj.conversionRate || 0,
              qtdVendasBrutas: metricsObj.qtdVendasBrutas || metricsObj.grossSalesCount || metricsObj.totalSales || 0,
              currentStock: metricsObj.currentStock || 0,
              stockCoverageDays: metricsObj.stockCoverageDays || 0
            });
          }
`;

code = code.replace(/if \(endpointData\.metrics\) \{[\s\S]*?\}\s*const chartArray/, metricsSetCode.trim() + '\n          const chartArray');

// 3. Setup the Grid Rendering for cards
const gridStartPattern = /\{\/\* row 1 \*\/\}\s*<Grid item xs=\{12\} sx=\{\{ mb: -2.25 \}\}>\s*<Typography variant="h5">Métricas de Vendas<\/Typography>\s*<\/Grid>/;
const firstRowRegex = /\{\/\* row 1 \*\/\}[\s\S]*?(?=\{\/\* row 2 \*\/\}|{?\/\* Visão Geral das Vendas)/;

const cardsJSX = `
        {/* row 1 */}
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
                      opacity: isActive ? 1 : 0.6,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <AnalyticEcommerce
                      title={card.title}
                      count={formatCardValue(card, metrics[card.id] || 0)}
                      color={isActive ? 'primary' : 'inherit'}
                      extra="Clique para ver no gráfico"
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
`;

code = code.replace(firstRowRegex, cardsJSX + '\n        ');

// Replace activeMetricsList propagation
code = code.replace(
  /<IncomeAreaChart period=\{period\}\s+salesData=\{salesData\}\s*\/>/g,
  '<IncomeAreaChart period={period} salesData={salesData} activeMetricsList={activeMetrics} />'
);
code = code.replace(
  /<IncomeAreaChart period=\{period\} includeFrete=\{includeFrete\} salesData=\{salesData\} \/>/g,
  '<IncomeAreaChart period={period} includeFrete={includeFrete} salesData={salesData} activeMetricsList={activeMetrics} />'
);

fs.writeFileSync(path, code);
console.log('analytics updated');
