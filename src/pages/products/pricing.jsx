import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Alert,
  Divider,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PricingCalculator from 'utils/pricingCalculator';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import SyncOutlined from '@ant-design/icons/SyncOutlined';

// Exemplos de Templates Rápidos
const PLATFORM_TEMPLATES = {
  ml_premium: { name: 'Mercado Livre - Premium', commission: 16, fixed: 0 },
  ml_classic: { name: 'Mercado Livre - Clássico', commission: 11.5, fixed: 0 },
  shopee: { name: 'Shopee', commission: 20, fixed: 3 },
  amazon: { name: 'Amazon', commission: 15, fixed: 0 },
  custom: { name: 'Personalizado', commission: 0, fixed: 0 }
};

const fmtBRL = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PricingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const skuParam = searchParams.get('sku');

  // Search Autocomplete
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Controle de Loading e Produto
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  // States: Tabela 1 - Custo
  const [cost, setCost] = useState('');
  const [operationalCost, setOperationalCost] = useState('0.50');

  // States: Tabela 2 - Plataforma
  const [platform, setPlatform] = useState('ml_classic');
  const [commissionPercent, setCommissionPercent] = useState(11.5);
  const [fixedFee, setFixedFee] = useState(0);
  const [shippingCost, setShippingCost] = useState('0.00'); // Frete Vendedor
  const [taxesPercent, setTaxesPercent] = useState('8.60'); // Ex: Simples

  // States: Tabela 3 - Calculadora Direção (Margem => Preço || Preço => Margem)
  const [calcMode, setCalcMode] = useState('target_margin'); // target_margin ou target_price
  const [targetMargin, setTargetMargin] = useState('15.00');
  const [targetPrice, setTargetPrice] = useState('');

  // States: Resultados
  const [resultPrice, setResultPrice] = useState(0);
  const [resultProfit, setResultProfit] = useState(0);
  const [resultMargin, setResultMargin] = useState(0);
  const [resultBreakdown, setResultBreakdown] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Busca do Produto se o SKU for passado pela URL
  useEffect(() => {
    if (skuParam) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const auth = JSON.parse(localStorage.getItem('auth') || '{}');
          const token = auth?.token;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          let response;
          try {
            response = await axios.get(`http://localhost:5001/api/products/${encodeURIComponent(skuParam)}`, { headers });
          } catch (e) {
            response = await axios.get(`http://localhost:5001/api/products/db/${encodeURIComponent(skuParam)}`, { headers });
          }

          const productData = response.data?.data || response.data;

          if (productData) {
            setProductData(productData);
            
            // Preenche o custo base do produto se existir
            const currentCost = productData.currentCost || {};
            // Tenta usar o custo manual do produto se houver, caso contrário, usa o custo base (unitCost sem imposto) ou o costPerUnit anterior
            const baseCost = productData.cost != null ? productData.cost : 
                             (currentCost.unitCost || currentCost.costPerUnit || currentCost.price || 0);

            if (baseCost !== null && baseCost !== undefined) {
              setCost(String(baseCost));
            }
          }
        } catch (error) {
          console.error('Erro ao buscar produto:', error);
          setErrorMsg('Não foi possível carregar os dados do produto.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [skuParam]);

  // Busca os produtos para o Autocomplete
  useEffect(() => {
    if (!searchInputValue) {
      setSearchOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = auth?.token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

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
        console.error('Erro na busca:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Handler de mudança de template
  const handlePlatformChange = (e) => {
    const val = e.target.value;
    setPlatform(val);
    if (val !== 'custom') {
      const template = PLATFORM_TEMPLATES[val];
      setCommissionPercent(template.commission);
      setFixedFee(template.fixed);
    }
  };

  // Efeito principal de Recálculo Automático
  useEffect(() => {
    try {
      setErrorMsg('');
      const params = {
        cost: Number(cost) || 0,
        operationalCost: Number(operationalCost) || 0,
        shippingCost: Number(shippingCost) || 0,
        fixedFee: Number(fixedFee) || 0,
        commissionPercent: Number(commissionPercent) || 0,
        taxesPercent: Number(taxesPercent) || 0
      };

      if (calcMode === 'target_margin') {
        const trgMargin = Number(targetMargin) || 0;
        const result = PricingCalculator.calculatePriceFromMargin({
          ...params,
          targetMarginPercent: trgMargin
        });

        setResultPrice(result.finalPrice);
        setResultProfit(result.rawProfit);
        setResultMargin(trgMargin);
        setResultBreakdown(result.breakdown);
      } else {
        const trgPrice = Number(targetPrice) || 0;
        const result = PricingCalculator.calculateMarginFromPrice({
          ...params,
          finalPrice: trgPrice
        });

        setResultPrice(trgPrice);
        setResultProfit(result.rawProfit);
        setResultMargin(result.marginPercent);
        setResultBreakdown(result.breakdown);
      }
    } catch (err) {
      setErrorMsg(err.message);
      setResultPrice(0);
      setResultProfit(0);
      setResultMargin(0);
      setResultBreakdown(null);
    }
  }, [cost, operationalCost, shippingCost, fixedFee, commissionPercent, taxesPercent, calcMode, targetMargin, targetPrice]);

  return (
    <Grid container spacing={3}>
      {/* Cabeçalho */}
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <CalculatorOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Typography variant="h4">Simulador de Precificação (Markup & E-commerce)</Typography>
        </Stack>

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
                setCost('');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecione ou busque um produto (SKU ou Nome) para auto-preencher o custo"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingSearch ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  )
                }}
              />
            )}
          />

          {productData && (
            <Typography variant="subtitle1" color="primary.main" sx={{ mt: 2 }}>
              Produto Vinculado:{' '}
              <strong>
                {productData.sku} - {productData.name}
              </strong>
            </Typography>
          )}
        </MainCard>
      </Grid>

      {errorMsg && (
        <Grid item xs={12}>
          <Alert severity="error">{errorMsg}</Alert>
        </Grid>
      )}

      {/* Coluna Esquerda: Configurações */}
      <Grid item xs={12} md={7}>
        <Stack spacing={3}>
          {/* Custo da Mercadoria */}
          <MainCard title="1. Custos da Mercadoria Vendida (CMV)">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custo de Aquisição (Produto)"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  helperText="Custo NFe ou Manual"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custos Operacionais"
                  type="number"
                  value={operationalCost}
                  onChange={(e) => setOperationalCost(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  helperText="Embalagem, fitas, etiquetas..."
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* Taxas do E-commerce */}
          <MainCard title="2. Taxas do Marketplace / E-commerce">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select fullWidth value={platform} onChange={handlePlatformChange}>
                  {Object.entries(PLATFORM_TEMPLATES).map(([key, t]) => (
                    <MenuItem key={key} value={key}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Comissão da Plataforma"
                  type="number"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  disabled={platform !== 'custom'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tarifa Fixa (por venda)"
                  type="number"
                  value={fixedFee}
                  onChange={(e) => setFixedFee(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  disabled={platform !== 'custom'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frete pago pelo Vendedor"
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  helperText="Quando frete grátis é oferecido"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Impostos de Venda (Nota Fiscal)"
                  type="number"
                  value={taxesPercent}
                  onChange={(e) => setTaxesPercent(e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  helperText="Ex: Simples Nacional"
                />
              </Grid>
            </Grid>
          </MainCard>
        </Stack>
      </Grid>

      {/* Coluna Direita: Calculadora Resultante */}
      <Grid item xs={12} md={5}>
        <Stack spacing={3}>
          <MainCard title="3. Definição Estratégica" sx={{ bgcolor: 'primary.lighter' }}>
            <Box mb={2}>
              <Select
                fullWidth
                value={calcMode}
                onChange={(e) => setCalcMode(e.target.value)}
                size="small"
                sx={{ mb: 2, bgcolor: 'background.paper' }}
              >
                <MenuItem value="target_margin">Quero definir minha Margem (%) para achar o Preço</MenuItem>
                <MenuItem value="target_price">Quero definir meu Preço (R$) para achar o Lucro</MenuItem>
              </Select>

              {calcMode === 'target_margin' && (
                <TextField
                  fullWidth
                  label="Qual margem líquida você deseja ter?"
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              )}
              {calcMode === 'target_price' && (
                <TextField
                  fullWidth
                  label="Por qual preço você quer vender?"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              )}
            </Box>
          </MainCard>

          {/* Cards de Resultado */}
          <MainCard>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {calcMode === 'target_margin' ? 'Preço Sugerido para Venda:' : 'Análise do Preço Simulado:'}
            </Typography>

            <Typography variant="h2" color="primary.main" textAlign="center" my={2}>
              {fmtBRL(resultPrice)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', bgcolor: resultProfit >= 0 ? 'success.lighter' : 'error.lighter' }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    LUCRO LÍQUIDO
                  </Typography>
                  <Typography variant="h5" color={resultProfit >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                    {fmtBRL(resultProfit)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', bgcolor: resultMargin >= 0 ? 'success.lighter' : 'error.lighter' }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    MARGEM REAL
                  </Typography>
                  <Typography variant="h5" color={resultMargin >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                    {Number(resultMargin).toFixed(2)}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Detalhamento de Custos */}
            {resultBreakdown && (
              <Box mt={3} p={2} sx={{ bgcolor: 'secondary.lighter', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="secondary.main" mb={1.5}>
                  Composição de Custos e Taxas
                </Typography>
                <Grid container spacing={1} sx={{ '& .MuiGrid-item': { display: 'flex', justifyContent: 'space-between' } }}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Custo do Produto:</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.cost)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Tarifa Fixa / Venda:</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.fixedFee)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Comissão Plataforma ({commissionPercent}%):</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.commissionValue)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Impostos NF ({taxesPercent}%):</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.taxesValue)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Frete Vendedor:</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.shippingCost)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Custos Operacionais:</Typography>
                    <Typography borderBottom="1px dashed #ccc" variant="body2" fontWeight="medium">{fmtBRL(resultBreakdown.operationalCost)}</Typography>
                  </Grid>
                  <Grid item xs={12} mt={1}>
                    <Typography variant="subtitle2">Custo Total da Venda:</Typography>
                    <Typography variant="subtitle2" color="error.main">{fmtBRL(resultBreakdown.totalCost)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Aviso Operacional */}
            <Box mt={3} p={1.5} bgcolor="warning.lighter" borderRadius={1}>
              <Typography variant="caption" color="warning.dark">
                <strong>Resumo do Repasse:</strong> Se o produto for vendido a {fmtBRL(resultPrice)}, a plataforma irá descontar{' '}
                {fmtBRL(resultPrice * (commissionPercent / 100) + fixedFee)} de tarifas diretas, além de {fmtBRL(shippingCost)} de frete do
                vendedor e {fmtBRL(resultPrice * (taxesPercent / 100))} de nota fiscal.
              </Typography>
            </Box>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
