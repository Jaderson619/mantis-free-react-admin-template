const fs = require('fs');
const path = 'src/pages/products/analytics.jsx';
let code = fs.readFileSync(path, 'utf8');

const regexCards = /\{\/\* MÉTRICAS \(CARDS\) \*\/\}[\s\S]*?(?=\{\/\* GRÁFICO DE VENDAS HISTÓRICO \*\/\}|{?\/\* GRÁFICO)/;

const cardsJSX = `
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

        `;

if(code.match(regexCards)) {
  code = code.replace(regexCards, cardsJSX);
  fs.writeFileSync(path, code);
  console.log('Cards section replaced');
} else {
  console.log('Cards regex missed');
}
