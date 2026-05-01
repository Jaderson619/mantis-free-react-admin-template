const fs = require('fs');

const currentContent = fs.readFileSync('src/pages/products/pricing.jsx', 'utf8');

// Step 1: Update imports
const replaceImports = currentContent.replace(
  /import \{\s*Box,\s*Button,\s*Grid,[\s\S]*?CircularProgress\s*\} from '@mui\/material';/,
  `import {
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';`
).replace(
  /import SyncOutlined from '@ant-design\/icons\/SyncOutlined';/,
  `import SyncOutlined from '@ant-design/icons/SyncOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';`
);

// Step 2: Add states and methods right after errorMsg
const stateRegex = /const \[errorMsg, setErrorMsg\] = useState\(''\);/m;
const newStates = `const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [savedPricings, setSavedPricings] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSavedPricings = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth?.token;
      const headers = token ? { Authorization: \`Bearer \${token}\` } : {};
      const response = await axios.get('http://localhost:5001/api/pricings', { headers });
      
      const responseData = response.data?.data || response.data;
      const data = Array.isArray(responseData) ? responseData : (responseData?.items || []);
      
      if (Array.isArray(data)) {
        setSavedPricings(data);
      }
    } catch (e) {
      console.error('Erro ao buscar precificações salvas do backend', e);
    }
  };

  useEffect(() => {
    fetchSavedPricings();
  }, []);

  const handleSavePricing = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth?.token;
      const headers = token ? { Authorization: \`Bearer \${token}\` } : {};

      const payload = {
        productId: productData?.id || null,
        productName: productData ? productData.name : 'Produto Avulso',
        platformName: PLATFORM_TEMPLATES[platform]?.name || 'Personalizado',
        calculationMode: calcMode,
        targetValue: calcMode === 'target_margin' ? targetMargin : targetPrice,
        cost: Number(cost) + Number(operationalCost),
        finalPrice: resultPrice,
        rawProfit: resultProfit,
        marginPercent: resultMargin
      };

      await axios.post('http://localhost:5001/api/pricings', payload, { headers });
      
      setSuccessMsg('Simulação salva com sucesso no histórico!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      fetchSavedPricings();
      setIsDialogOpen(false);
    } catch (e) {
      console.error('Erro ao salvar precificação no backend', e);
      setErrorMsg('Erro ao salvar simulação. Verifique sua conexão.');
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth?.token;
      const headers = token ? { Authorization: \`Bearer \${token}\` } : {};
      
      await axios.delete(\`http://localhost:5001/api/pricings/\${id}\`, { headers });
      
      setSavedPricings(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Erro ao apagar precificação salva', e);
    }
  };`;

const withStates = replaceImports.replace(stateRegex, newStates);


// Step 3: Replace Layout
const returnBlockStart = /return \(\s*<Grid container spacing=\{3\}>\s*\{\/\* Cabeçalho \*\/\}/m;

// We will split the file by return ( 
const returnSplit = withStates.split('return (');
const beforeReturn = returnSplit[0];
const afterReturn = returnSplit[1];

// Inside afterReturn, we need to extract the form core.
// The form core starts at `<Grid item xs={12}>\n        <Stack direction="row"`
// And ends near the end of `<Box mt={3} p={1.5} bgcolor="warning.lighter"`

// Rather than regex madness, let's just write the JSX directly that replaces everything after `return (`.

const completeReturn = `return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalculatorOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Typography variant="h4">Simulador de Precificação</Typography>
          </Stack>
          <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
            Nova Simulação
          </Button>
        </Stack>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <MainCard title="Histórico de Precificações Salvas">
          {savedPricings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma precificação salva no momento.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Produto</TableCell>
                    <TableCell>Plataforma</TableCell>
                    <TableCell align="right">Modo Alvo</TableCell>
                    <TableCell align="right">Custo Tot.</TableCell>
                    <TableCell align="right">Preço Venda</TableCell>
                    <TableCell align="right">Lucro R$</TableCell>
                    <TableCell align="right">Margem %</TableCell>
                    <TableCell align="center">Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedPricings.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{new Date(row.createdAt || Date.now()).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>{row.platformName}</TableCell>
                      <TableCell align="right">
                        {row.calculationMode === 'target_margin' ? \`Margem \${row.targetValue}%\` : \`Preço \${fmtBRL(row.targetValue)}\`}
                      </TableCell>
                      <TableCell align="right">{fmtBRL(row.cost)}</TableCell>
                      <TableCell align="right"><strong>{fmtBRL(row.finalPrice)}</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                        {fmtBRL(row.rawProfit)}
                      </TableCell>
                      <TableCell align="right">{Number(row.marginPercent || 0).toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleDeleteSaved(row.id)}>
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Nova Simulação</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            
            <Grid item xs={12}>
              {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
              <MainCard sx={{ mb: 2 }}>
                <Autocomplete
                  options={searchOptions}
                  getOptionLabel={(option) => \`\${option.sku} - \${option.name}\`}
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
                      label="Selecione ou busque um produto para auto-preencher"
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
                    Produto Vinculado: <strong>{productData.sku} - {productData.name}</strong>
                  </Typography>
                )}
              </MainCard>
            </Grid>

            {/* Coluna Esquerda: Configurações */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <MainCard title="1. Custos da Mercadoria Vendida (CMV)">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Custo de Aquisição" type="number" value={cost} onChange={(e) => setCost(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Custos Operacionais" type="number" value={operationalCost} onChange={(e) => setOperationalCost(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                    </Grid>
                  </Grid>
                </MainCard>

                <MainCard title="2. Taxas do Marketplace / E-commerce">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Select fullWidth value={platform} onChange={handlePlatformChange}>
                        {Object.entries(PLATFORM_TEMPLATES).map(([key, t]) => (
                          <MenuItem key={key} value={key}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Comissão da Plataforma" type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} disabled={platform !== 'custom'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Tarifa Fixa (por venda)" type="number" value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} disabled={platform !== 'custom'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Frete pelo Vendedor" type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Impostos (NF)" type="number" value={taxesPercent} onChange={(e) => setTaxesPercent(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
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
                    <Select fullWidth value={calcMode} onChange={(e) => setCalcMode(e.target.value)} size="small" sx={{ mb: 2, bgcolor: 'background.paper' }}>
                      <MenuItem value="target_margin">Quero definir minha Margem (%)</MenuItem>
                      <MenuItem value="target_price">Quero definir meu Preço (R$)</MenuItem>
                    </Select>
                    {calcMode === 'target_margin' && (
                      <TextField fullWidth label="Margem Líquida Alvo (%)" type="number" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} sx={{ bgcolor: 'background.paper' }} />
                    )}
                    {calcMode === 'target_price' && (
                      <TextField fullWidth label="Preço de Venda Definido (R$)" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={{ bgcolor: 'background.paper' }} />
                    )}
                  </Box>
                </MainCard>

                <MainCard>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {calcMode === 'target_margin' ? 'Preço Sugerido para Venda:' : 'Análise do Preço Simulado:'}
                  </Typography>
                  <Typography variant="h2" color="primary.main" textAlign="center" my={2}>{fmtBRL(resultPrice)}</Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: resultProfit >= 0 ? 'success.lighter' : 'error.lighter' }}>
                        <Typography variant="caption" color="text.secondary" display="block">LUCRO LÍQUIDO</Typography>
                        <Typography variant="h5" color={resultProfit >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">{fmtBRL(resultProfit)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: resultMargin >= 0 ? 'success.lighter' : 'error.lighter' }}>
                        <Typography variant="caption" color="text.secondary" display="block">MARGEM REAL</Typography>
                        <Typography variant="h5" color={resultMargin >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">{Number(resultMargin).toFixed(2)}%</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {resultBreakdown && (
                    <Box mt={3} p={2} sx={{ bgcolor: 'secondary.lighter', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="secondary.main" mb={1.5}>Composição de Custos</Typography>
                      <Grid container spacing={1} sx={{ '& .MuiGrid-item': { display: 'flex', justifyContent: 'space-between' } }}>
                        <Grid item xs={12}><Typography variant="body2">Custo Produto:</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.cost)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="body2">Tarifa Fixa:</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.fixedFee)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="body2">Comissão ({commissionPercent}%):</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.commissionValue)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="body2">Impostos ({taxesPercent}%):</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.taxesValue)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="body2">Frete Vendedor:</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.shippingCost)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="body2">Operacional:</Typography><Typography variant="body2">{fmtBRL(resultBreakdown.operationalCost)}</Typography></Grid>
                        <Grid item xs={12} mt={1}><Typography variant="subtitle2">Custo Total:</Typography><Typography variant="subtitle2" color="error.main">{fmtBRL(resultBreakdown.totalCost)}</Typography></Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  <Box mt={2}>
                    <Button fullWidth variant="outlined" color="primary" startIcon={<SaveOutlined />} onClick={handleSavePricing}>
                      Gravar Resultado
                    </Button>
                  </Box>
                </MainCard>
              </Stack>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
          <Button onClick={() => setIsDialogOpen(false)} variant="text" color="inherit">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}`;

fs.writeFileSync('src/pages/products/pricing.jsx', beforeReturn + completeReturn);
