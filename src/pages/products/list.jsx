import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Pagination, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, List, ListItem, ListItemText, Collapse, Tooltip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import axios from 'axios';
import AddOutlined from '@ant-design/icons/PlusOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCost, setFilterCost] = useState('all');
  const [filterTax, setFilterTax] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: 'success', msg: '' });
  const [editErrors, setEditErrors] = useState({});
  // Upload XML
  const [importOpen, setImportOpen] = useState(false);
  const [importFiles, setImportFiles] = useState([]); // {file, name, status, result, error}
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState('auto'); // futuro: single|batch|auto
  const [importCanceled, setImportCanceled] = useState(false);
  const [currentController, setCurrentController] = useState(null);
  // Lotes expandidos
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [lotsDetailsOpen, setLotsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(new Set());

  const fetchProductDetails = async (sku) => {
    setLoadingDetails(prev => new Set(prev).add(sku));
    try {
      let response;
      try {
        response = await axios.get(`http://localhost:5001/api/products/${encodeURIComponent(sku)}`, {
          headers: { ...getAuthHeaders() }
        });
      } catch (apiError) {
        response = await axios.get(`http://localhost:5001/api/products/db/${encodeURIComponent(sku)}`, {
          headers: { ...getAuthHeaders() }
        });
      }
      
      const productDetails = response.data?.data || response.data;
      
      if (productDetails) {
        // Atualizar o produto na lista com os detalhes completos (incluindo costLots)
        setProducts(prev => prev.map(p => p.sku === sku ? { ...p, ...productDetails } : p));
        
        // Retornar os detalhes para uso imediato
        return productDetails;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar detalhes do produto:', err);
      
      // Mostrar erro se backend estiver offline
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setSnack({ open: true, type: 'error', msg: 'Backend offline! Por favor, inicie o servidor backend.' });
      }
      return null;
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(sku);
        return next;
      });
    }
  };

  const toggleRow = async (sku) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(sku)) {
      newExpanded.delete(sku);
    } else {
      newExpanded.add(sku);
      // Buscar detalhes completos se ainda não temos costLots
      const product = products.find(p => p.sku === sku);
      if (!product?.costLots) {
        await fetchProductDetails(sku);
      }
    }
    setExpandedRows(newExpanded);
  };

  const openLotsDetails = async (product) => {
    // Buscar detalhes completos se ainda não temos costLots
    if (!product.costLots || product.costLots.length === 0) {
      // Buscar os detalhes e receber diretamente
      const productDetails = await fetchProductDetails(product.sku);
      
      if (productDetails) {
        setSelectedProduct(productDetails);
      } else {
        setSelectedProduct(product);
      }
    } else {
      setSelectedProduct(product);
    }
    
    setLotsDetailsOpen(true);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = async (targetPage = page, targetLimit = limit, searchTerm = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        page: targetPage, 
        limit: targetLimit
      };
      
      // Adicionar busca se houver termo
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Tenta primeiro a nova rota, se falhar usa a antiga
      let response;
      try {
        response = await axios.get('http://localhost:5001/api/products', {
          params,
          headers: { ...getAuthHeaders() }
        });
      } catch (apiError) {
        response = await axios.get('http://localhost:5001/api/products/db', {
          params,
          headers: { ...getAuthHeaders() }
        });
      }
      
      // Suporta múltiplas estruturas de resposta
      const apiData = response.data?.data || response.data;
      let items = apiData?.items || apiData?.products || apiData;
      
      // Se não for array, tenta converter
      if (!Array.isArray(items)) {
        items = items ? [items] : [];
      }
      
      setProducts(items);
      setTotal(apiData?.total || apiData?.pagination?.total || items.length);
      setTotalPages(apiData?.totalPages || apiData?.pagination?.totalPages || 1);
      setPage(apiData?.page || apiData?.pagination?.page || targetPage);
      setLimit(apiData?.limit || apiData?.pagination?.limit || targetLimit);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      
      const errorMsg = err.response?.data?.error?.message || 
                       err.response?.data?.message || 
                       err.message || 
                       'Erro ao carregar produtos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page, limit); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtros locais adicionais (a busca por termo já é feita na API)
  const filtered = products.filter(p => {
    // Tratamento flexível para diferentes estruturas
    const hasCost = p.currentCost?.costPerUnit || p.currentCost?.totalCost || p.cost;
    const costCond = filterCost === 'all' || (filterCost === 'with' ? hasCost > 0 : !hasCost);
    // backend ainda não envia imposto separado -> placeholder
    const taxCond = filterTax === 'all';
    return costCond && taxCond;
  });

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchProducts(1, limit, search); // Reset para página 1 ao buscar
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openEdit = (product) => {
    setEditSku(product.sku);
    setEditName(product.name || '');
    setEditCost(''); // Custo não é mais editável diretamente, vem dos lotes
    setEditErrors({});
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
  };

  const validateEdit = () => {
    const errs = {};
    if (!editName.trim()) errs.name = 'Nome obrigatório';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveEdit = async () => {
    if (!validateEdit()) return;
    setEditSaving(true);
    try {
      const payload = { name: editName.trim() };
      await axios.patch(`http://localhost:5001/api/products/${encodeURIComponent(editSku)}`, payload, { headers: { ...getAuthHeaders() } });
      // Atualizar localmente sem refetch completo
      setProducts(prev => prev.map(p => p.sku === editSku ? { ...p, name: payload.name, updatedAt: new Date().toISOString() } : p));
      setSnack({ open: true, type: 'success', msg: 'Produto atualizado' });
      setEditOpen(false);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, type: 'error', msg: 'Erro ao salvar' });
    } finally {
      setEditSaving(false);
    }
  };

  return (
  <MainCard title={`Total de SKUs cadastrados: ${total}`}
      secondary={<Button variant="contained" color="success" startIcon={<AddOutlined />} onClick={() => navigate('/produtos/novo')}>Cadastrar Novo</Button>}
    >
      <Stack direction={{ xs:'column', md:'row' }} spacing={2} mb={2} alignItems={{ md:'center' }} justifyContent="space-between">
        <Box flex={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField label="Pesquisar SKU" value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth size="small" value={filterCost} onChange={(e) => setFilterCost(e.target.value)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="with">Com Custo</MenuItem>
                <MenuItem value="without">Sem Custo</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth size="small" value={filterTax} onChange={(e) => setFilterTax(e.target.value)}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="with">Com Imposto</MenuItem>
                <MenuItem value="without">Sem Imposto</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<ReloadOutlined />} onClick={() => fetchProducts(page, limit)} variant="outlined">Recarregar</Button>
                <Button startIcon={<UploadOutlined />} color="secondary" variant="contained" onClick={()=> { setImportFiles([]); setImportOpen(true); }}>Importar XML</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Stack>
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="40"></TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Custo Atual</TableCell>
                <TableCell align="right">Custo/Unidade</TableCell>
                <TableCell align="right">Imposto (R$)</TableCell>
                <TableCell align="center">Lotes</TableCell>
                <TableCell align="right">Estoque Total</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={10} align="center"><Typography color="error.main">{error}</Typography></TableCell></TableRow>
              )}
              {!loading && !error && filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} align="center"><Typography variant="body2" color="text.secondary">Nenhum produto encontrado</Typography></TableCell></TableRow>
              )}
              {!loading && !error && filtered.map((p) => {
                const isExpanded = expandedRows.has(p.sku);
                const isLoadingDetails = loadingDetails.has(p.sku);
                const fmtBRL = (v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
                
                // Tratamento flexível para diferentes estruturas de dados
                const currentCost = p.currentCost || {};
                const costLots = p.costLots || [];
                
                // Fallback para estrutura antiga (p.cost direto)
                const purchasePrice = currentCost.purchasePrice ?? p.cost ?? null;
                const taxPaid = currentCost.taxPaid ?? p.tax ?? null;
                
                // Calcular costPerUnit se não estiver disponível
                let costPerUnit = currentCost.costPerUnit ?? currentCost.totalCost ?? p.cost ?? null;
                if (costPerUnit == null && purchasePrice != null) {
                  // Calcular: purchasePrice + taxPaid (se existir)
                  costPerUnit = purchasePrice + (taxPaid || 0);
                }
                
                // Na listagem usa totalLots, nos detalhes usa costLots.length
                const lotsCount = p.totalLots ?? costLots.length ?? 0;
                
                // Na listagem usa currentCost.quantityAvailable, nos detalhes calcula dos lotes
                const totalStock = currentCost.quantityAvailable ?? 
                  p.quantityInStock ?? 
                  p.fixedStock ?? 
                  costLots.reduce((sum, lot) => sum + (lot.quantityAvailable || 0), 0);
                
                return (
                  <React.Fragment key={p.sku || p.uuid}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleRow(p.sku)} 
                          disabled={lotsCount === 0 || isLoadingDetails}
                        >
                          {isLoadingDetails ? <CircularProgress size={16} /> : (isExpanded ? <UpOutlined /> : <DownOutlined />)}
                        </IconButton>
                      </TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.name || '-'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {fmtBRL(purchasePrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          {fmtBRL(costPerUnit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {fmtBRL(taxPaid)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`${lotsCount} lote(s) de compra`}>
                          <Chip 
                            icon={<DatabaseOutlined />}
                            label={lotsCount} 
                            size="small" 
                            color={lotsCount > 0 ? "primary" : "default"}
                            onClick={() => lotsCount > 0 && openLotsDetails(p)}
                            sx={{ cursor: lotsCount > 0 ? 'pointer' : 'default' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={totalStock} 
                          size="small" 
                          color={totalStock > 0 ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {p.createdAt ? dayjs(p.createdAt).format('DD/MM/YYYY') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton size="small" onClick={() => openEdit(p)} aria-label="Editar">
                            <EditOutlined />
                          </IconButton>
                          {costLots.length > 0 && (
                            <IconButton size="small" color="primary" onClick={() => openLotsDetails(p)} aria-label="Ver Lotes">
                              <InfoCircleOutlined />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Linha expandida com detalhes dos lotes */}
                    {costLots.length > 0 && (
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DatabaseOutlined /> Lotes de Compra
                              </Typography>
                              <Table size="small" aria-label="lotes">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell>Data Compra</TableCell>
                                    <TableCell align="right">Qtd Comprada</TableCell>
                                    <TableCell align="right">Qtd Disponível</TableCell>
                                    <TableCell align="right">Custo Unit.</TableCell>
                                    <TableCell align="right">Imposto</TableCell>
                                    <TableCell align="right">Frete</TableCell>
                                    <TableCell align="right">Outros</TableCell>
                                    <TableCell align="right">Total Lote</TableCell>
                                    <TableCell align="right">Custo/Un Final</TableCell>
                                    <TableCell>NF-e</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {costLots.map((lot) => (
                                    <TableRow key={lot.uuid}>
                                      <TableCell>
                                        <Typography variant="caption">
                                          {lot.purchaseDate ? dayjs(lot.purchaseDate).format('DD/MM/YYYY HH:mm') : '-'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">{lot.quantityPurchased || 0}</TableCell>
                                      <TableCell align="right">
                                        <Chip 
                                          label={lot.quantityAvailable || 0} 
                                          size="small"
                                          color={lot.quantityAvailable > 0 ? "success" : "default"}
                                        />
                                      </TableCell>
                                      <TableCell align="right">{fmtBRL(lot.unitCost)}</TableCell>
                                      <TableCell align="right">{fmtBRL(lot.taxCost)}</TableCell>
                                      <TableCell align="right">{fmtBRL(lot.shippingCost)}</TableCell>
                                      <TableCell align="right">{fmtBRL(lot.otherCosts)}</TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" fontWeight="medium">
                                          {fmtBRL(lot.totalCost)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                                          {fmtBRL(lot.costPerUnit)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        {lot.supplierNfeId ? (
                                          <Tooltip title={lot.supplierNfeId}>
                                            <Chip 
                                              label="NF-e" 
                                              size="small" 
                                              variant="outlined"
                                              color="info"
                                            />
                                          </Tooltip>
                                        ) : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p:2 }}>
          <Select size="small" value={limit} onChange={(e)=> { const newLimit = Number(e.target.value); setLimit(newLimit); fetchProducts(1, newLimit); }}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
          <Pagination count={totalPages} page={page} color="primary" shape="rounded" onChange={(_, p)=> { setPage(p); fetchProducts(p, limit); }} showFirstButton showLastButton />
        </Stack>
      </Paper>
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Produto - {editSku}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Nome"
            value={editName}
            onChange={(e)=> setEditName(e.target.value)}
            fullWidth
            margin="normal"
            error={Boolean(editErrors.name)}
            helperText={editErrors.name}
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Nota:</strong> O custo do produto é calculado automaticamente com base nos lotes de compra. 
              Para atualizar custos, importe novas NF-e através do botão "Importar NF-e (XML)".
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editSaving}>Cancelar</Button>
          <Button onClick={saveEdit} variant="contained" disabled={editSaving}>{editSaving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog Importar XML */}
      <Dialog open={importOpen} onClose={() => !importing && setImportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Importar NF-e (XML)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Button component="label" variant="outlined" disabled={importing}>
              Selecionar Arquivos XML
              <input hidden multiple accept=".xml" type="file" onChange={(e)=> {
                const files = Array.from(e.target.files || []);
                const mapped = files.map(f => ({ file: f, name: f.name, status: 'ready', progress: 0 }));
                setImportFiles(mapped);
                setImportCanceled(false);
              }} />
            </Button>
            {importFiles.length > 0 && (
              <Paper variant="outlined" sx={{ maxHeight: 280, overflow: 'auto' }}>
                <List dense>
                  {importFiles.map((f,i) => (
                    <ListItem key={i} alignItems="flex-start">
                      <ListItemText
                        primary={f.name}
                        secondary={<>
                          {f.error && <Typography variant="caption" color="error">Erro: {f.error}</Typography>}
                          {f.status==='ready' && <Typography variant="caption" color="text.secondary">Pronto para enviar</Typography>}
                          {f.status==='reading' && <Typography variant="caption" color="text.secondary">Lendo arquivo...</Typography>}
                          {f.status==='uploading' && <Typography variant="caption" color="text.secondary">Enviando... {Math.round(f.progress||0)}%</Typography>}
                          {f.status==='canceled' && <Typography variant="caption" color="warning.main">Cancelado</Typography>}
                          {f.status==='done' && <Typography variant="caption" color="success.main">Importado: {(f.result?.items)||0} itens{f.result?.alreadyImported? ' (já existia)':''}</Typography>}
                          {f.status==='error' && !f.error && <Typography variant="caption" color="error">Erro no envio</Typography>}
                          {['uploading'].includes(f.status) && (
                            <LinearProgress variant="determinate" value={f.progress || 0} sx={{ mt:0.5, height:4, borderRadius:1 }} />
                          )}
                        </>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            {importing && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Progresso geral: {(() => { const total = importFiles.length || 1; const done = importFiles.filter(f => f.status==='done').length; return Math.round((done/total)*100); })()}%
                </Typography>
                <LinearProgress variant="determinate" value={(() => { const total = importFiles.length || 1; const done = importFiles.filter(f => f.status==='done').length; return (done/total)*100; })()} sx={{ mt:0.5 }} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setImportOpen(false)} disabled={importing}>Fechar</Button>
          {importing ? (
            <Button color="warning" onClick={() => {
              setImportCanceled(true);
              if (currentController) currentController.abort();
            }}>Cancelar Upload</Button>
          ) : (
            <Button variant="contained" disabled={importFiles.length===0} onClick={async () => {
              if (importFiles.length===0) return;
              setImporting(true);
              setImportCanceled(false);
              const updated = importFiles.map(f => ({ ...f, status: 'ready', progress: 0, error: null, result: null }));
              setImportFiles(updated);
              for (let i=0; i<updated.length; i++) {
                if (importCanceled) break;
                // marcar lendo
                setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'reading', progress:0 } : f));
                // ler arquivo
                const fileObj = updated[i];
                const xmlContent = await new Promise(resolve => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = () => resolve(null);
                  reader.readAsText(fileObj.file);
                });
                if (!xmlContent) {
                  setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'error', error:'Falha leitura' } : f));
                  continue;
                }
                if (importCanceled) break;
                // enviar
                const controller = new AbortController();
                setCurrentController(controller);
                setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'uploading', progress:0 } : f));
                try {
                  const res = await axios.post('http://localhost:5001/api/nfe-upload', { xml: xmlContent }, {
                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                    signal: controller.signal,
                    onUploadProgress: (evt) => {
                      if (!evt.total) return; // às vezes não disponível
                      const prog = Math.round((evt.loaded / evt.total) * 100);
                      setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, progress: prog } : f));
                    }
                  });
                  const result = res.data?.data?.result;
                  setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'done', progress:100, result } : f));
                } catch (err) {
                  if (controller.signal.aborted || importCanceled) {
                    setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'canceled', error:'Cancelado' } : f));
                    break;
                  } else {
                    console.error(err);
                    setImportFiles(prev => prev.map((f, idx) => idx===i ? { ...f, status:'error', error: err.response?.data?.error || 'Erro envio' } : f));
                  }
                } finally {
                  setCurrentController(null);
                }
              }
              setImporting(false);
              if (importCanceled) {
                setSnack({ open:true, type:'warning', msg:'Upload cancelado' });
              } else {
                setSnack({ open:true, type:'success', msg:'Processo concluído' });
                fetchProducts(page, limit);
              }
            }}>Enviar</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes Completos dos Lotes */}
      <Dialog
        open={lotsDetailsOpen}
        onClose={() => setLotsDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DatabaseOutlined style={{ fontSize: 24 }} />
            <Typography variant="h5">Histórico Completo de Lotes de Custo</Typography>
          </Stack>
          {selectedProduct && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              SKU: <strong>{selectedProduct.sku}</strong> - {selectedProduct.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && selectedProduct.costLots && selectedProduct.costLots.length > 0 ? (() => {
            const fmtBRL = (v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
            return (
            <Stack spacing={3}>
              {/* Resumo Geral */}
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Custo Atual</Typography>
                    <Typography variant="h6">{((v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-')(selectedProduct.currentCost?.costPerUnit || 0)}/un</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Total de Lotes</Typography>
                    <Typography variant="h6">{selectedProduct.costLots.length}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Estoque Total</Typography>
                    <Typography variant="h6">
                      {selectedProduct.costLots.reduce((sum, lot) => sum + (lot.quantityAvailable || 0), 0)} un
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary">Valor em Estoque</Typography>
                    <Typography variant="h6">
                      {fmtBRL(selectedProduct.costLots.reduce((sum, lot) => 
                        sum + ((lot.quantityAvailable || 0) * (lot.costPerUnit || 0)), 0
                      ))}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabela Detalhada */}
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell><strong>Data da Compra</strong></TableCell>
                      <TableCell align="right"><strong>Qtd Comprada</strong></TableCell>
                      <TableCell align="right"><strong>Qtd Disponível</strong></TableCell>
                      <TableCell align="right"><strong>% Utilizado</strong></TableCell>
                      <TableCell align="right"><strong>Custo Unitário</strong></TableCell>
                      <TableCell align="right"><strong>Custo Imposto</strong></TableCell>
                      <TableCell align="right"><strong>Custo Frete</strong></TableCell>
                      <TableCell align="right"><strong>Outros Custos</strong></TableCell>
                      <TableCell align="right"><strong>Custo Total</strong></TableCell>
                      <TableCell align="right"><strong>Custo/Unidade</strong></TableCell>
                      <TableCell><strong>NF-e</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProduct.costLots
                      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                      .map((lot, idx) => {
                        const percentUsed = lot.quantityPurchased > 0
                          ? ((lot.quantityPurchased - lot.quantityAvailable) / lot.quantityPurchased * 100).toFixed(1)
                          : 0;
                        const isFullyUsed = lot.quantityAvailable === 0;
                        
                        return (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              bgcolor: isFullyUsed ? 'grey.50' : 'inherit',
                              opacity: isFullyUsed ? 0.6 : 1
                            }}
                          >
                            <TableCell>
                              {dayjs(lot.purchaseDate).format('DD/MM/YYYY')}
                              {isFullyUsed && (
                                <Chip 
                                  label="ESGOTADO" 
                                  size="small" 
                                  color="default" 
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">{lot.quantityPurchased || 0}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={lot.quantityAvailable || 0}
                                size="small"
                                color={lot.quantityAvailable > 0 ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                                <Box sx={{ width: 60 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(percentUsed, 100)}
                                    color={percentUsed >= 90 ? 'error' : percentUsed >= 50 ? 'warning' : 'primary'}
                                  />
                                </Box>
                                <Typography variant="caption">{percentUsed}%</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{fmtBRL(lot.unitCost || 0)}</TableCell>
                            <TableCell align="right">{fmtBRL(lot.taxCost || 0)}</TableCell>
                            <TableCell align="right">{fmtBRL(lot.shippingCost || 0)}</TableCell>
                            <TableCell align="right">{fmtBRL(lot.otherCosts || 0)}</TableCell>
                            <TableCell align="right"><strong>{fmtBRL(lot.totalCost || 0)}</strong></TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={fmtBRL(lot.costPerUnit || 0)}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              {lot.supplierNfeId ? (
                                <Tooltip title={`NF-e: ${lot.supplierNfeId}`}>
                                  <Chip 
                                    icon={<InfoCircleOutlined />}
                                    label={lot.supplierNfeId.substring(0, 8) + '...'}
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                  />
                                </Tooltip>
                              ) : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Legenda */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Dica:</strong> Os lotes estão ordenados por data de compra (mais recente primeiro). 
                  Lotes esgotados aparecem com fundo cinza. O percentual de utilização indica quanto do lote já foi consumido.
                </Typography>
              </Box>
            </Stack>
            );
          })() : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhum lote de custo disponível</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLotsDetailsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open:false }))} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack(s => ({ ...s, open:false }))}>{snack.msg}</Alert>
      </Snackbar>
    </MainCard>
  );
}
