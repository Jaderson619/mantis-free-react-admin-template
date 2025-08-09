import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Pagination, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import axios from 'axios';
import AddOutlined from '@ant-design/icons/PlusOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = async (targetPage = page, targetLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5001/api/products', {
        params: { page: targetPage, limit: targetLimit },
        headers: { ...getAuthHeaders() }
      });
      const apiData = response.data?.data;
      const items = apiData?.items || [];
      setProducts(Array.isArray(items) ? items : []);
      setTotal(apiData?.total || items.length);
      setTotalPages(apiData?.totalPages || 1);
      setPage(apiData?.page || targetPage);
      setLimit(apiData?.limit || targetLimit);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page, limit); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = products.filter(p => {
    const term = search.trim().toLowerCase();
    const hasTerm = !term || (p.sku || '').toLowerCase().includes(term) || (p.name || '').toLowerCase().includes(term);
    const costCond = filterCost === 'all' || (filterCost === 'with' ? p.cost > 0 : !p.cost);
    // backend ainda não envia imposto -> placeholder
    const taxCond = filterTax === 'all';
    return hasTerm && costCond && taxCond;
  });

  const openEdit = (product) => {
    setEditSku(product.sku);
    setEditName(product.name || '');
    setEditCost(product.cost != null ? String(product.cost) : '');
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
    if (editCost !== '') {
      const num = Number(editCost.replace(',', '.'));
      if (isNaN(num)) errs.cost = 'Custo inválido';
      else if (num < 0) errs.cost = 'Custo >= 0';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveEdit = async () => {
    if (!validateEdit()) return;
    setEditSaving(true);
    try {
      const payload = { name: editName.trim() };
      if (editCost !== '') payload.cost = Number(editCost.replace(',', '.'));
      else payload.cost = null;
  await axios.patch(`http://localhost:5001/api/products/${encodeURIComponent(editSku)}`, payload, { headers: { ...getAuthHeaders() } });
      // Atualizar localmente sem refetch completo
      setProducts(prev => prev.map(p => p.sku === editSku ? { ...p, name: payload.name, cost: payload.cost, updatedAt: new Date().toISOString() } : p));
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
                <TableCell>SKU</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Custo</TableCell>
                <TableCell align="right">Imposto (%)</TableCell>
                <TableCell align="right">Estoque Fixo</TableCell>
                <TableCell align="right">Qtd Estoque</TableCell>
                <TableCell>Criado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={7} align="center"><Typography color="error.main">{error}</Typography></TableCell></TableRow>
              )}
              {!loading && !error && filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center"><Typography variant="body2" color="text.secondary">Nenhum produto encontrado</Typography></TableCell></TableRow>
              )}
              {!loading && !error && filtered.map((p) => (
                <TableRow key={p.sku} hover>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.name || '-'}</TableCell>
                  <TableCell align="right">{p.cost != null ? p.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</TableCell>
                  <TableCell align="right">{p.taxPercent != null ? p.taxPercent.toFixed(2) : '-'}</TableCell>
                  <TableCell align="right">{p.stockFixed ? <Chip label="Sim" color="success" size="small" /> : <Chip label="Não" size="small" />}</TableCell>
                  <TableCell align="right">{p.stock != null ? p.stock : '-'}</TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.createdAt ? dayjs(p.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                    <IconButton size="small" onClick={() => openEdit(p)} aria-label="Editar">
                      <EditOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
          <TextField
            label="Custo (R$)"
            value={editCost}
            onChange={(e)=> setEditCost(e.target.value.replace(/[^0-9.,]/g, ''))}
            fullWidth
            margin="normal"
            placeholder="Ex: 123,45"
            error={Boolean(editErrors.cost)}
            helperText={editErrors.cost || 'Deixe vazio para limpar custo'}
          />
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
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open:false }))} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack(s => ({ ...s, open:false }))}>{snack.msg}</Alert>
      </Snackbar>
    </MainCard>
  );
}
