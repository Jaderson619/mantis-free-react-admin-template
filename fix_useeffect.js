const fs = require('fs');
const path = 'src/pages/products/analytics.jsx';
let code = fs.readFileSync(path, 'utf8');

// Adiciona um console.log no payload bruto para debugar e tenta mapear chaves extras comuns
const repl = `
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
`;

code = code.replace(
  /if \(endpointData\) \{\s*const metricsObj = endpointData\.metrics \|\| \{\};\s*setMetrics\(\{[\s\S]*?\}\);/m,
  repl.trim()
);

fs.writeFileSync(path, code);
console.log('Added payload logger and expanded visit keys');
