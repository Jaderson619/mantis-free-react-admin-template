const fs = require('fs');
let code = fs.readFileSync('src/pages/products/list.jsx', 'utf8');

// 1. Substituir a linha de import para incluir Tabs e Tab
code = code.replace(
  "import { Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography, Pagination, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, List, ListItem, ListItemText, Collapse, Tooltip, Divider } from '@mui/material';",
  "import { Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography, Pagination, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, List, ListItem, ListItemText, Collapse, Tooltip, Divider, RadioGroup, Radio, FormControlLabel, Autocomplete, Tabs, Tab } from '@mui/material';"
);

// 2. Estado do activeTab
code = code.replace(
  "const [loadingDetails, setLoadingDetails] = useState(new Set());",
  "const [loadingDetails, setLoadingDetails] = useState(new Set());\n  const [activeTab, setActiveTab] = useState(0);"
);

// 3. Atualizar openLotsDetails para forçar atualização do array
code = code.replace(
  "  const openLotsDetails = async (product) => {\n    // Buscar detalhes completos se ainda não temos costLots\n    if (!product.costLots || product.costLots.length === 0) {\n      // Buscar os detalhes e receber diretamente\n      const productDetails = await fetchProductDetails(product.sku);\n      \n      if (productDetails) {\n        setSelectedProduct(productDetails);\n      } else {\n        setSelectedProduct(product);\n      }\n    } else {\n      setSelectedProduct(product);\n    }\n    \n    setLotsDetailsOpen(true);\n  };",
  "  const openLotsDetails = async (product) => {\n    setLotsDetailsOpen(true);\n    setSelectedProduct(product);\n    setActiveTab(0);\n    const productDetails = await fetchProductDetails(product.sku);\n    if (productDetails) {\n      setSelectedProduct(productDetails);\n      if (productDetails.type === 'combo') {\n        setActiveTab(1);\n      }\n    }\n  };"
);

// 4. Transformar o antigo "Modal de Detalhes Completos dos Lotes"
// Nós vamos usar Regex com string bruta pra não errar. Vamos capturar a Dialog Title até o fim do Content e substituir.
// É mais seguro fazer um replace do miolo:
let oldModalStart = code.indexOf('<DialogTitle>\n          <Stack direction="row" alignItems="center" spacing={1}>\n            <DatabaseOutlined style={{ fontSize: 24 }} />\n            <Typography variant="h5">Histórico Completo de Lotes de Custo</Typography>');
if(oldModalStart !== -1) {
  let oldModalEnd = code.indexOf('          })() : (\n            <Box sx={{ p: 4, textAlign: \'center\' }}>\n              <Typography color="text.secondary">Nenhum lote de custo disponível</Typography>\n            </Box>\n          )}\n        </DialogContent>');
  
  if(oldModalEnd !== -1) {
    let oldContent = code.substring(oldModalStart, oldModalEnd + 219); // 219 chars da cauda
    
    let newContent = `
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DatabaseOutlined style={{ fontSize: 24 }} />
            <Typography variant="h5">Detalhes Contábeis e Estoque</Typography>
          </Stack>
          {selectedProduct && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              SKU: <strong>{selectedProduct.sku}</strong> - {selectedProduct.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct ? (() => {
            const fmtBRL = (v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
            return (
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Custo Atual</Typography>
                    <Typography variant="h6">{((v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-')(selectedProduct.currentCost?.costPerUnit || 0)}/un</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Total de Lotes</Typography>
                    <Typography variant="h6">{selectedProduct.costLots ? selectedProduct.costLots.length : 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Estoque Total</Typography>
                    <Typography variant="h6">
                      {selectedProduct.costLots ? selectedProduct.costLots.reduce((sum, lot) => sum + (lot.quantityAvailable || 0), 0) : 0} un
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Valor em Estoque</Typography>
                    <Typography variant="h6">
                      {fmtBRL(selectedProduct.costLots ? selectedProduct.costLots.reduce((sum, lot) => 
                        sum + ((lot.quantityAvailable || 0) * (lot.costPerUnit || 0)), 0
                      ) : 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                  <Tab label="Lotes de Compra" />
                  <Tab label="Histórico de Vendas" />
                </Tabs>
              </Box>

              {activeTab === 0 && (
                <Box>
                  {(!selectedProduct.costLots || selectedProduct.costLots.length === 0) ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Nenhum lote de compra encontrado para este produto.
                    </Typography>
                  ) : (
                    <>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell>Data Compra</TableCell>
                              <TableCell align="center">Qtd Comprada</TableCell>
                              <TableCell align="center">Qtd Disponível</TableCell>
                              <TableCell align="right">Custo Unit.</TableCell>
                              <TableCell align="right">Frete</TableCell>
                              <TableCell align="right">Outros</TableCell>
                              <TableCell align="right">Custo/Un Final</TableCell>
                              <TableCell align="center">NF-e</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProduct.costLots.map((lot) => {
                              const isDepleted = lot.quantityAvailable <= 0;
                              const utilizationPct = lot.quantityPurchased > 0 
                                ? Math.round(((lot.quantityPurchased - lot.quantityAvailable) / lot.quantityPurchased) * 100)
                                : 0;
                              
                              return (
                                <TableRow 
                                  key={lot.uuid}
                                  sx={{ 
                                    opacity: isDepleted ? 0.6 : 1,
                                    bgcolor: isDepleted ? 'grey.50' : 'inherit'
                                  }}
                                >
                                  <TableCell>
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'text.primary'}>
                                      {lot.purchaseDate ? dayjs(lot.purchaseDate).format('DD/MM/YYYY HH:mm') : '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'text.primary'}>
                                      {lot.quantityPurchased}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title={\`\${utilizationPct}% consumido\`}>
                                      <Chip 
                                        label={lot.quantityAvailable} 
                                        size="small"
                                        color={isDepleted ? "default" : "success"}
                                        variant={isDepleted ? "outlined" : "filled"}
                                        sx={{ minWidth: 40 }}
                                      />
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'text.primary'}>
                                      {fmtBRL(lot.unitCost)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'text.primary'}>
                                      {fmtBRL(lot.shippingCost)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'text.primary'}>
                                      {fmtBRL(lot.otherCosts)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" color={isDepleted ? 'text.secondary' : 'primary.main'} fontWeight="bold">
                                      {fmtBRL(lot.costPerUnit)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2" color="text.secondary">
                                      {lot.supplierNfeId || '-'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        <strong>Dica:</strong> Os lotes estão ordenados por data de compra (mais recente primeiro). Lotes esgotados aparecem com fundo cinza. O percentual de utilização indica quanto do lote já foi consumido.
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  {selectedProduct.type === 'combo' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Este é um produto do tipo Kit/Combo. As baixas de estoque foram processadas e abatidas dos produtos filhos. A listagem abaixo contabiliza a movimentação conjunta deste pacote.
                    </Alert>
                  )}
                  {(!selectedProduct.salesHistory || selectedProduct.salesHistory.length === 0) ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Nenhuma venda recente registrada.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell>Data da Venda</TableCell>
                            <TableCell>Pedido</TableCell>
                            <TableCell align="center">Qtd. Saída</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="right">Custo Unitário (Rateio)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedProduct.salesHistory.map((sale, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {sale.date ? dayjs(sale.date).format('DD/MM/YYYY HH:mm') : '-'}
                              </TableCell>
                              <TableCell>
                                {sale.orderId ? (
                                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                    {sale.orderId}
                                  </Typography>
                                ) : '-'}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="error.main" fontWeight="bold">
                                  -{sale.quantity || 1}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={sale.status || 'Pendente'} size="small" />
                              </TableCell>
                              <TableCell align="right">
                                {fmtBRL(sale.unitCostAllocated)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

            </Stack>
            );
          })() : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhum lote de custo disponível</Typography>
            </Box>
          )}
        </DialogContent>
`;

    code = code.replace(oldContent, newContent);
  }
}

// 5. Retirar "&& lotsCount > 0" dos cliques pra poder clicar em combos vazios
code = code.replace(
  "onClick={() => lotsCount > 0 && openLotsDetails(p)}",
  "onClick={() => openLotsDetails(p)}"
);
code = code.replace(
  "sx={{ cursor: lotsCount > 0 ? 'pointer' : 'default' }}",
  "sx={{ cursor: 'pointer' }}"
);
code = code.replace(
  "{lotsCount > 0 && (\n                            <Tooltip title=\"Ver Lotes\">\n                              <IconButton size=\"small\" color=\"primary\" onClick={() => openLotsDetails(p)} aria-label=\"Ver Lotes\">\n                                <InfoCircleOutlined />\n                              </IconButton>\n                            </Tooltip>\n                          )}",
  "<Tooltip title=\"Ver Lotes/Histórico\">\n                              <IconButton size=\"small\" color=\"primary\" onClick={() => openLotsDetails(p)} aria-label=\"Ver Detalhes\">\n                                <InfoCircleOutlined />\n                              </IconButton>\n                            </Tooltip>"
);

fs.writeFileSync('src/pages/products/list.jsx', code);
