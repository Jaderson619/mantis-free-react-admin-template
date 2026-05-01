import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Slider, Stack, Divider, TextField, Tooltip } from '@mui/material';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';

export default function ScenarioSimulator({ currentData }) {
  const [newPrice, setNewPrice] = useState(currentData.currentPrice || 0);

  useEffect(() => {
    if (currentData.currentPrice) {
      setNewPrice(currentData.currentPrice);
    }
  }, [currentData.currentPrice]);

  if (!currentData) return null;

  const {
    currentPrice = 0,
    unitCost = 0,
    marketplaceFeePercent = 0,
    fixedShippingCost = 0,
    taxPercent = 0,
    priceElasticityFactor = 1.5,
    estimatedCurrentDailySales = 0
  } = currentData;

  // Cálculos Básicos Atuais
  const currentFee = currentPrice * (marketplaceFeePercent / 100);
  const currentTax = currentPrice * (taxPercent / 100);
  const currentNetProfitUnit = currentPrice - unitCost - currentFee - fixedShippingCost - currentTax;
  const currentMarginPercent = currentPrice > 0 ? (currentNetProfitUnit / currentPrice) * 100 : 0;
  const currentTotalDailyProfit = estimatedCurrentDailySales * currentNetProfitUnit;
  const currentTotalDailyRevenue = estimatedCurrentDailySales * currentPrice;

  // Cálculos do Novo Cenário (Simulação)
  const priceVariationPercent = currentPrice > 0 ? (newPrice - currentPrice) / currentPrice : 0;
  const salesImpact = -(priceVariationPercent * priceElasticityFactor); 
  const estimatedNewDailySales = Math.max(0, currentPrice > 0 ? estimatedCurrentDailySales * (1 + salesImpact) : 0);

  const newFee = newPrice * (marketplaceFeePercent / 100);
  const newTax = newPrice * (taxPercent / 100);
  const newNetProfitUnit = newPrice - unitCost - newFee - fixedShippingCost - newTax;
  const newMarginPercent = newPrice > 0 ? (newNetProfitUnit / newPrice) * 100 : 0;
  const newTotalDailyProfit = estimatedNewDailySales * newNetProfitUnit;
  const newTotalDailyRevenue = estimatedNewDailySales * newPrice;

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatPercent = (val) => val.toFixed(1) + '%';
  const formatNum = (val) => val.toFixed(1);

  const profitDiff = newTotalDailyProfit - currentTotalDailyProfit;
  const isProfitPositive = profitDiff > 0;

  return (
    <Card sx={{ mt: 3, border: '1px solid', borderColor: 'primary.light' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h5" color="primary">Simulador de Cenários (What-If Analysis)</Typography>
          <Tooltip title="Arraste o slider para ver como alterações de preço impactam vendas, faturamento e lucro com base no Fator de Elasticidade enviado pelo painel/ML.">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Ajuste de Preço</Typography>
              <TextField
                fullWidth
                label="Novo Preço de Venda (R$)"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                inputProps={{ step: "0.1" }}
                sx={{ mb: 3 }}
              />
              <Typography gutterBottom>
                Preço Atual: <strong>{formatCurrency(currentPrice)}</strong>
              </Typography>
              <Slider
                value={newPrice}
                min={currentPrice * 0.5}
                max={currentPrice * 1.5}
                step={0.5}
                onChange={(e, val) => setNewPrice(val)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatCurrency(v)}
                marks={[
                  { value: currentPrice, label: 'Atual' }
                ]}
              />
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Fator de Elasticidade: <strong>{priceElasticityFactor}</strong>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  (Cada 1% de desconto gera {priceElasticityFactor}% de aumento nas vendas)
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom>Lucro Un. Líquido</Typography>
                    <Typography variant="h4">{formatCurrency(newNetProfitUnit)}</Typography>
                    <Typography variant="body2" color={newNetProfitUnit >= currentNetProfitUnit ? 'success.main' : 'error.main'}>
                      Margem: {formatPercent(newMarginPercent)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom>Estimativa Vendas Diárias</Typography>
                    <Typography variant="h4">{formatNum(estimatedNewDailySales)} un</Typography>
                    <Typography variant="body2" color={estimatedNewDailySales >= estimatedCurrentDailySales ? 'success.main' : 'error.main'}>
                      Atualmente: {formatNum(estimatedCurrentDailySales)} un
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom>Faturamento Diário</Typography>
                    <Typography variant="h4">{formatCurrency(newTotalDailyRevenue)}</Typography>
                    <Typography variant="body2" color={newTotalDailyRevenue >= currentTotalDailyRevenue ? 'success.main' : 'error.main'}>
                      Anterior: {formatCurrency(currentTotalDailyRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ bgcolor: isProfitPositive ? 'success.lighter' : 'error.lighter' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom>Lucro Total Diário Estimado</Typography>
                    <Typography variant="h4" color={isProfitPositive ? 'success.dark' : 'error.dark'}>
                      {formatCurrency(newTotalDailyProfit)}
                    </Typography>
                    <Typography variant="body2" color={isProfitPositive ? 'success.main' : 'error.main'}>
                      Variação: {isProfitPositive ? '+' : ''}{formatCurrency(profitDiff)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
