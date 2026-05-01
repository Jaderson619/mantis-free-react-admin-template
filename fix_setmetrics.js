const fs = require('fs');
let path = 'src/pages/products/analytics.jsx';
let code = fs.readFileSync(path, 'utf8');

const updatedSetMetrics = `
            const metricsObj = endpointData.metrics || {};
            setMetrics({
              vendasBrutas: metricsObj.vendasBrutas || metricsObj.grossRevenue || metricsObj.totalRevenue || 0,
              vendasConcluidas: metricsObj.vendasConcluidas || metricsObj.completedSales || metricsObj.totalRevenue || 0,
              unidadesVendidas: metricsObj.unidadesVendidas || metricsObj.soldUnits || metricsObj.totalQuantity || metricsObj.totalSales || 0,
              precoMedio: metricsObj.precoMedio || metricsObj.avgPrice || (metricsObj.totalSales ? metricsObj.totalRevenue / metricsObj.totalSales : 0),
              visitasUnicas: metricsObj.visitasUnicas || metricsObj.uniqueViews || endpointData.views || 0,
              totalVisitas: metricsObj.totalVisitas || metricsObj.totalViews || metricsObj.totalVisits || endpointData.views || 0,
              compradoresUnicos: metricsObj.compradoresUnicos || metricsObj.uniqueBuyers || metricsObj.totalSales || 0,
              conversao: metricsObj.conversao || metricsObj.conversionRate || 0,
              qtdVendasBrutas: metricsObj.qtdVendasBrutas || metricsObj.grossSalesCount || metricsObj.totalSales || 0,
              currentStock: metricsObj.currentStock || 0,
              stockCoverageDays: metricsObj.stockCoverageDays || 0
            });
`;

code = code.replace(/const metricsObj = endpointData\.metrics \|\| \{\};[\s\S]*?\}\);/m, updatedSetMetrics.trim());

const fallbackSetMetrics = `setMetrics({ vendasBrutas: 0, vendasConcluidas: 0, unidadesVendidas: 0, precoMedio: 0, visitasUnicas: 0, totalVisitas: 0, compradoresUnicos: 0, conversao: 0, qtdVendasBrutas: 0, currentStock: 0, stockCoverageDays: 0 });`;
code = code.replace(/setMetrics\(\{ visits: 0, sales: 0, conversion: 0, stock: 0, stockCoverage: 0, revenue: 0 \}\);/m, fallbackSetMetrics);

fs.writeFileSync(path, code);
console.log('Fixed setMetrics');
