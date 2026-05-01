import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography, Pagination, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, List, ListItem, ListItemText, Collapse, Tooltip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import DialogErrorBoundary from 'components/DialogErrorBoundary';
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
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';
import FundViewOutlined from '@ant-design/icons/FundViewOutlined';

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCost, setFilterCost] = useState('all');
  
  // --- NOVOS STATES PARA ORDENAÇÃO ---
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editCalculatedCost, setEditCalculatedCost] = useState('');
  const [editNfeCost, setEditNfeCost] = useState('');
  const [editTaxPerUnit, setEditTaxPerUnit] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: 'success', msg: '' });
  const [editErrors, setEditErrors] = useState({});
  // Upload XML
  const [importOpen, setImportOpen] = useState(false);
  const [importFiles, setImportFiles] = useState([]); // {file, filename, status, progress, error, nfeData}
  const [importing, setImporting] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  // Lotes expandidos
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [lotsDetailsOpen, setLotsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(new Set());
  
  // Ref para verificar se componente está montado
  const isMountedRef = useRef(true);
  
  // Ref para prevenir duplo clique
  const uploadingRef = useRef(false);
  
  // Ref para prevenir atualizações simultâneas de estado
  const updatingStatusRef = useRef(false);
  
  // Ref para armazenar último estado recebido (debounce manual)
  const lastStatusUpdateRef = useRef(null);
  const statusUpdateTimeoutRef = useRef(null);

  const fetchProductDetails = async (sku) => {
    if (!isMountedRef.current) return null;
    
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
      
      if (!isMountedRef.current) return null;
      
      const productDetails = response.data?.data || response.data;
      
        if (productDetails) {
          // Atualizar o produto na lista com os detalhes completos (incluindo costLots)
          if (isMountedRef.current) {
            setProducts(prev => prev.map(p => {
              if (p.sku === sku) {
                return {
                  ...p,
                  ...productDetails,
                  currentCost: {
                    ...(p.currentCost || {}),
                    ...(productDetails.currentCost || {})
                  }
                };
              }
              return p;
            }));
          }        // Retornar os detalhes para uso imediato
        return productDetails;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar detalhes do produto:', err);
      
      // Mostrar erro se backend estiver offline
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        if (isMountedRef.current) {
          setSnack({ open: true, type: 'error', msg: 'Backend offline! Por favor, inicie o servidor backend.' });
        }
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoadingDetails(prev => {
          const next = new Set(prev);
          next.delete(sku);
          return next;
        });
      }
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    setPage(1); // Voltar à primeira página ao reordenar
    fetchProducts(1, limit, search, property, newOrder);
  };

  const fetchProducts = async (targetPage = page, targetLimit = limit, searchTerm = search, sortField = orderBy, sortDir = order) => {
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

      // Adicionar ordenação para a API se suportado
      if (sortField) {
        params.sortBy = sortField;
        params.sortOrder = sortDir;
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
      
      // A API retorna: { success: true, data: { items: [...], total, page, limit, totalPages } }
      const apiData = response.data?.data || response.data;
      const { items = [], total = 0, totalPages = 1, page: currentPage = 1, limit: currentLimit = 50 } = apiData;
      
      // A API já retorna currentCost como objeto - apenas garantir formato correto
      const mappedItems = items.map(item => ({
        ...item,
        totalLots: parseInt(item.totalLots || 0, 10),
        // currentCost já vem estruturado da API
        currentCost: item.currentCost || {
          unitCost: null,
          taxPerUnit: 0,
          shippingPerUnit: 0,
          otherCostsPerUnit: 0,
          costPerUnit: 0,
          totalCost: null,
          quantityAvailable: null
        }
      }));
      
      setProducts(mappedItems);
      setTotal(total);
      setTotalPages(totalPages);
      setPage(currentPage);
      setLimit(currentLimit);
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
    return costCond;
  });

  // Ordenação
  const sortedFiltered = [...filtered].sort((a, b) => {
    let aValue, bValue;
    
    switch(orderBy) {
      case 'sku':
        aValue = String(a.sku || '').toLowerCase();
        bValue = String(b.sku || '').toLowerCase();
        break;
      case 'name':
        aValue = String(a.name || '').toLowerCase();
        bValue = String(b.name || '').toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
      case 'lastPurchase':
        aValue = new Date(a.lastPurchaseDate || 0).getTime();
        bValue = new Date(b.lastPurchaseDate || 0).getTime();
        break;
      case 'cost':
        aValue = Number(a.currentCost?.costPerUnit || a.cost || 0);
        bValue = Number(b.currentCost?.costPerUnit || b.cost || 0);
        break;
      case 'stock':
        aValue = Number(a.currentCost?.quantityAvailable || 0);
        bValue = Number(b.currentCost?.quantityAvailable || 0);
        break;
      default:
        aValue = String(a.sku || '').toLowerCase();
        bValue = String(b.sku || '').toLowerCase();
    }

    if (bValue < aValue) return order === 'asc' ? 1 : -1;
    if (bValue > aValue) return order === 'asc' ? -1 : 1;
    return 0;
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

    const currentCost = product.currentCost || {};
    const unitCost = currentCost.unitCost ?? currentCost.price ?? 0;
    const taxPerUnit = currentCost.taxPerUnit ?? currentCost.taxPaid ?? 0;
    const costPerUnit = currentCost.costPerUnit ?? currentCost.unitCost ?? 0;

    // Pega o custo manual (pode vir de product.customCost ou product.manualCost, o ideal é mapear onde está no backend)
    // Vamos usar a variável `cost` ou deixá-la vazia para o cliente preencher.
    setEditCost(product.cost || '');
    setEditCalculatedCost(costPerUnit);
    setEditNfeCost(unitCost);
    setEditTaxPerUnit(taxPerUnit);    setEditErrors({});
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
      // Enviamos manualCost ou cost, substituindo o que for necessário. Se for string vazia, enviamos null para manter só o calculado.
      const payload = { 
        name: editName.trim(),
        cost: editCost !== '' ? Number(String(editCost).replace(',', '.')) : null
      };
      await axios.patch(`http://localhost:5001/api/products/${encodeURIComponent(editSku)}`, payload, { headers: { ...getAuthHeaders() } });
      // Atualizar localmente sem refetch completo
      setProducts(prev => prev.map(p => {
        if (p.sku === editSku) {
          return { 
            ...p, 
            name: payload.name, 
            cost: payload.cost,
            updatedAt: new Date().toISOString() 
          };
        }
        return p;
      }));
      setSnack({ open: true, type: 'success', msg: 'Produto atualizado' });
      setEditOpen(false);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, type: 'error', msg: 'Erro ao salvar' });
    } finally {
      setEditSaving(false);
    }
  };

  // Upload múltiplo de NFes
  const handleUploadNFes = async () => {
    // Prevenir duplo clique
    if (uploadingRef.current || !isMountedRef.current) {
      console.log('Upload já em andamento ou componente desmontado');
      return;
    }
    
    if (importFiles.length === 0) {
      setSnack({ open: true, type: 'warning', msg: 'Selecione pelo menos um arquivo XML' });
      return;
    }

    // Validações
    const maxFiles = 50;
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (importFiles.length > maxFiles) {
      setSnack({ open: true, type: 'error', msg: `Máximo de ${maxFiles} arquivos por vez` });
      return;
    }

    const invalidFiles = importFiles.filter(f => !f.file.name.toLowerCase().endsWith('.xml'));
    if (invalidFiles.length > 0) {
      setSnack({ open: true, type: 'error', msg: 'Todos os arquivos devem ser XML' });
      return;
    }

    const largeFiles = importFiles.filter(f => f.file.size > maxFileSize);
    if (largeFiles.length > 0) {
      setSnack({ open: true, type: 'error', msg: 'Arquivo muito grande. Tamanho máximo: 10MB' });
      return;
    }

    // Marcar que upload está em andamento
    uploadingRef.current = true;
    
    if (!isMountedRef.current) {
      uploadingRef.current = false;
      return;
    }
    
    console.log('📤 Iniciando upload de', importFiles.length, 'arquivos');
    
    // Usar requestAnimationFrame para garantir que atualizações ocorram fora do ciclo de render
    requestAnimationFrame(() => {
      if (!isMountedRef.current) {
        uploadingRef.current = false;
        return;
      }
      
      setImporting(true);
      
      // Resetar status dos arquivos com delay
      setTimeout(() => {
        if (!isMountedRef.current) return;
        
        console.log('🔄 Resetando status dos arquivos para "pending"');
        setImportFiles(prev => prev.map(f => ({ 
          ...f, 
          status: 'pending', 
          progress: 0, 
          error: null, 
          nfeData: null 
        })));
      }, 0);
    });

    try {
      // Criar FormData com múltiplos arquivos
      const formData = new FormData();
      importFiles.forEach(f => {
        formData.append('files', f.file);
      });

      console.log('📡 Enviando', importFiles.length, 'arquivos para API...');
      
      // Upload para a API
      const response = await axios.post(
        'http://localhost:5001/api/nfe/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
          }
        }
      );

      if (!isMountedRef.current) {
        uploadingRef.current = false;
        return;
      }

      const { batchId: newBatchId, message } = response.data;
      console.log('✅ Upload concluído! Batch ID:', newBatchId);
      
      // Usar requestAnimationFrame para atualizar estado
      requestAnimationFrame(() => {
        if (!isMountedRef.current) {
          uploadingRef.current = false;
          return;
        }
        
        setBatchId(newBatchId);
        setSnack({ open: true, type: 'info', msg: message });
        
        // Iniciar polling de status com pequeno delay
        setTimeout(() => {
          if (isMountedRef.current) {
            startStatusPolling(newBatchId);
          }
        }, 100);
      });

    } catch (error) {
      if (!isMountedRef.current) {
        uploadingRef.current = false;
        return;
      }
      
      console.error('Erro no upload:', error);
      
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message || 
                       'Erro ao enviar arquivos';
      
      // Usar requestAnimationFrame para atualizar estado de erro
      requestAnimationFrame(() => {
        if (!isMountedRef.current) {
          uploadingRef.current = false;
          return;
        }
        
        setSnack({ open: true, type: 'error', msg: errorMsg });
        
        // Marcar todos como erro com delay
        setTimeout(() => {
          if (!isMountedRef.current) return;
          
          setImportFiles(prev => prev.map(f => ({ 
            ...f, 
            status: 'failed', 
            error: errorMsg 
          })));
          
          setImporting(false);
        }, 0);
        
        uploadingRef.current = false;
      });
    } finally {
      // Garantir que a flag seja limpa
      uploadingRef.current = false;
    }
  };

  // Função para aplicar atualizações de estado de forma segura
  const applyStatusUpdate = useCallback((statusData) => {
    if (!isMountedRef.current) return;
    
    console.log('🔄 Aplicando atualização de status:', statusData);
    
    // Cancelar atualização anterior se existir
    if (statusUpdateTimeoutRef.current) {
      clearTimeout(statusUpdateTimeoutRef.current);
    }
    
    // Armazenar último status
    lastStatusUpdateRef.current = statusData;
    
    // Agendar atualização com pequeno delay (debounce)
    statusUpdateTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const data = lastStatusUpdateRef.current;
      if (!data) return;
      
      try {
        setImportStatus(data);

        if (data.files && Array.isArray(data.files)) {
          console.log('📝 Atualizando status de', data.files.length, 'arquivos');
          
          setImportFiles(prev => {
            const updated = prev.map(f => {
              if (!f || !f.file) return f;
              
              const serverFile = data.files.find(sf => sf.filename === f.file.name);
              if (serverFile) {
                console.log('  ↳', f.file.name, ':', serverFile.status);
                return {
                  ...f,
                  status: serverFile.status,
                  error: serverFile.error,
                  errorType: serverFile.errorType,
                  nfeData: serverFile.nfeData,
                  progress: serverFile.status === 'success' ? 100 :
                           serverFile.status === 'processing' ? 50 :
                           serverFile.status === 'skipped' ? 100 :
                           serverFile.status === 'failed' ? 0 : 0
                };
              }
              return f;
            });
            
            console.log('✅ Arquivos atualizados:', updated.map(f => ({ name: f.file?.name, status: f.status })));
            return updated;
          });
        } else {
          console.log('⚠️ Nenhum arquivo recebido no status');
        }
      } catch (error) {
        console.error('❌ Erro ao aplicar atualização de status:', error);
      }
    }, 100); // Debounce de 100ms
  }, []);

  // Polling de status do batch - versão otimizada
  const startStatusPolling = useCallback((batchIdToCheck) => {
    console.log('🔄 Iniciando polling de status para batch:', batchIdToCheck);
    
    const interval = setInterval(async () => {
      // Verificar se pode atualizar
      if (!isMountedRef.current) {
        console.log('⚠️ Componente desmontado, parando polling');
        return;
      }
      
      if (updatingStatusRef.current) {
        console.log('⏳ Atualização anterior ainda em andamento, aguardando...');
        return;
      }
      
      updatingStatusRef.current = true;
      
      try {
        console.log('📡 Consultando status do batch:', batchIdToCheck);
        const response = await axios.get(
          `http://localhost:5001/api/nfe/status/${batchIdToCheck}`,
          { headers: { ...getAuthHeaders() } }
        );

        if (!isMountedRef.current) {
          console.log('⚠️ Componente desmontado após request, parando polling');
          clearInterval(interval);
          updatingStatusRef.current = false;
          return;
        }

        const statusData = response.data;
        console.log('📊 Status recebido:', {
          status: statusData.status,
          progress: statusData.progress,
          processed: statusData.processed,
          totalFiles: statusData.totalFiles,
          filesCount: statusData.files?.length
        });
        
        // Usar a função de aplicação segura de updates
        applyStatusUpdate(statusData);

        // Verificar se concluído
        if (statusData.status === 'completed' || statusData.status === 'completed_with_errors') {
          console.log('✅ Processamento concluído, parando polling');
          clearInterval(interval);
          
          requestAnimationFrame(() => {
            if (!isMountedRef.current) {
              updatingStatusRef.current = false;
              return;
            }
            
            setPollingInterval(null);
            setImporting(false);

            const successMsg = statusData.status === 'completed'
              ? `✅ Importação concluída! ${statusData.successful} de ${statusData.totalFiles} NFes importadas`
              : `⚠️ Concluído com erros: ${statusData.successful} sucesso, ${statusData.failed} falhas`;

            setSnack({ open: true, type: statusData.status === 'completed' ? 'success' : 'warning', msg: successMsg });

            // Atualizar lista de produtos após pequeno delay
            setTimeout(() => {
              if (isMountedRef.current) {
                fetchProducts(page, limit);
              }
            }, 200);
            
            updatingStatusRef.current = false;
          });
        } else {
          // Liberar flag para próxima atualização
          updatingStatusRef.current = false;
        }

      } catch (error) {
        console.error('❌ Erro ao consultar status:', error);
        updatingStatusRef.current = false;
        
        if (error.response?.status === 404) {
          console.log('⚠️ Batch não encontrado, parando polling');
          clearInterval(interval);
          requestAnimationFrame(() => {
            if (!isMountedRef.current) {
              return;
            }
            
            setPollingInterval(null);
            setImporting(false);
            setSnack({ open: true, type: 'error', msg: 'Batch não encontrado ou expirado' });
            updatingStatusRef.current = false;
          });
        } else {
          updatingStatusRef.current = false;
        }
      }
    }, 2000);

    if (isMountedRef.current) {
      setPollingInterval(interval);
    }
  }, [page, limit, applyStatusUpdate]); // Dependências do useCallback

  // Limpar polling ao desmontar componente
  useEffect(() => {
    // Marcar componente como montado
    isMountedRef.current = true;
    
    return () => {
      // Marcar componente como desmontado
      isMountedRef.current = false;
      updatingStatusRef.current = false;
      
      // Limpar timers
      if (statusUpdateTimeoutRef.current) {
        clearTimeout(statusUpdateTimeoutRef.current);
      }
      
      // Limpar polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Cancelar importação
  const handleCancelImport = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setImporting(false);
    setSnack({ open: true, type: 'warning', msg: 'Importação cancelada pelo usuário' });
  };

  // Fechar dialog com segurança
  const handleCloseImportDialog = () => {
    // Limpar polling se estiver ativo
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Usar setTimeout para permitir que o React processe a atualização de estado
    setTimeout(() => {
      if (isMountedRef.current) {
        setImportOpen(false);
        setImporting(false);
      }
    }, 0);
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
              <Stack direction="row" spacing={1}>
                <Button startIcon={<ReloadOutlined />} onClick={() => fetchProducts(page, limit)} variant="outlined">Recarregar</Button>
                <Button startIcon={<UploadOutlined />} color="secondary" variant="contained" onClick={()=> { 
                  setImportFiles([]);
                  setBatchId(null);
                  setImportStatus(null);
                  setImportOpen(true); 
                }}>Importar NFe (XML)</Button>
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
                <TableCell sortDirection={orderBy === 'sku' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'sku'}
                    direction={orderBy === 'sku' ? order : 'asc'}
                    onClick={() => handleRequestSort('sku')}
                  >
                    SKU
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={orderBy === 'cost' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'cost'}
                    direction={orderBy === 'cost' ? order : 'asc'}
                    onClick={() => handleRequestSort('cost')}
                  >
                    Custo (NFe)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Custo Manual</TableCell>
                <TableCell align="right">Custo Final</TableCell>
                <TableCell align="center">Lotes</TableCell>
                <TableCell align="right" sortDirection={orderBy === 'stock' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'stock'}
                    direction={orderBy === 'stock' ? order : 'asc'}
                    onClick={() => handleRequestSort('stock')}
                  >
                    Estoque Total
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Criado em
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'lastPurchase' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'lastPurchase'}
                    direction={orderBy === 'lastPurchase' ? order : 'asc'}
                    onClick={() => handleRequestSort('lastPurchase')}
                  >
                    Última Compra
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={11} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              )}
              {error && !loading && (
                <TableRow><TableCell colSpan={11} align="center"><Typography color="error.main">{error}</Typography></TableCell></TableRow>
              )}
              {!loading && !error && sortedFiltered.length === 0 && (
                <TableRow><TableCell colSpan={11} align="center"><Typography variant="body2" color="text.secondary">Nenhum produto encontrado</Typography></TableCell></TableRow>
              )}
              {!loading && !error && sortedFiltered.map((p) => {
                const isExpanded = expandedRows.has(p.sku);
                const isLoadingDetails = loadingDetails.has(p.sku);
                const fmtBRL = (v) => v != null ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
                
                // Usar dados já mapeados da API
                const currentCost = p.currentCost || {};
                const costLots = p.costLots || [];
                
                // Dados de custo (usando nomes corretos da API)
                const unitCostNfe = currentCost.unitCost ?? currentCost.price ?? 0;
                const unitCostManual = p.cost;
                const costPerUnit = unitCostManual != null ? unitCostManual : (currentCost.costPerUnit ?? currentCost.unitCost ?? 0); // Custo total por unidade

                const totalStock = currentCost.quantityAvailable || 0; // Estoque total
                const lotsCount = p.totalLots || costLots.length || 0; // Total de lotes

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
                        <Typography variant="body2" color="text.secondary">
                          {unitCostNfe ? fmtBRL(unitCostNfe) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={unitCostManual != null ? "warning.main" : "text.secondary"} fontWeight={unitCostManual != null ? "medium" : "regular"}>
                          {unitCostManual != null ? fmtBRL(unitCostManual) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          {fmtBRL(costPerUnit)}
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
                      <TableCell>
                        <Typography variant="caption">
                          {p.lastPurchaseDate ? dayjs(p.lastPurchaseDate).format('DD/MM/YYYY') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Análise de Desempenho">
                                <IconButton size="small" onClick={() => navigate(`/produtos/analise?sku=${encodeURIComponent(p.sku)}`)} color="primary">
                                  <FundViewOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Precificar">
                            <IconButton size="small" onClick={() => navigate(`/produtos/precificacao?sku=${encodeURIComponent(p.sku)}`)} color="success">
                              <CalculatorOutlined />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(p)} aria-label="Editar">
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                          {lotsCount > 0 && (
                            <Tooltip title="Ver Lotes">
                              <IconButton size="small" color="primary" onClick={() => openLotsDetails(p)} aria-label="Ver Lotes">
                                <InfoCircleOutlined />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Linha expandida com detalhes dos lotes */}
                    {costLots.length > 0 && (
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
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
          <TextField
            label="Custo Manual (R$)"
            value={editCost}
            onChange={(e)=> setEditCost(e.target.value.replace(/[^0-9.,]/g, ''))}
            fullWidth
            margin="normal"
            placeholder="Deixe em branco para usar apenas os lotes"
            helperText="Se preenchido, será somado aos impostos ou usado prioritariamente."
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.primary" gutterBottom>
              <strong>Resumo de Custos Atuais NFe/Lotes:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              • Custo de Compra (Base): {Number(editNfeCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
              • Custo Final pelo Lote: = {Number(editCalculatedCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              <strong>Nota:</strong> Se o custo manual for preenchido, ele assumirá o controle e passará a ser o Custo Final na tabela.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={editSaving}>Cancelar</Button>
          <Button onClick={saveEdit} variant="contained" disabled={editSaving}>{editSaving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog Importar XML - Renderização condicional com key estável */}
      {importOpen && (
        <DialogErrorBoundary onReset={() => {
          setImportOpen(false);
          setImporting(false);
          setImportFiles([]);
          setImportStatus(null);
        }}>
          <Dialog 
            key={`import-dialog-${batchId || 'new'}`}
            open={importOpen} 
            onClose={(event, reason) => {
              // Prevenir fechamento durante importação ou por ESC/backdrop
              if (importing) return;
              if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
              handleCloseImportDialog();
            }} 
            maxWidth="md" 
            fullWidth
            disableEscapeKeyDown={true}
            onBackdropClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            keepMounted={false}
            disablePortal={false}
          >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5">Importar NFe (XML)</Typography>
              <Typography variant="caption" color="text.secondary">
                Upload múltiplo de até 50 arquivos XML (máx. 10MB cada)
              </Typography>
            </Box>
            {importStatus && (
              <Chip 
                label={`${importStatus.progress}%`}
                color={importStatus.status === 'completed' ? 'success' : 'primary'}
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Seletor de arquivos */}
            <Button 
              component="label" 
              variant="outlined" 
              startIcon={<UploadOutlined />}
              disabled={importing}
              fullWidth
            >
              Selecionar Arquivos XML
              <input 
                hidden 
                multiple 
                accept=".xml" 
                type="file" 
                onChange={(e)=> {
                  const files = Array.from(e.target.files || []);
                  const mapped = files.map(f => ({ 
                    file: f, 
                    filename: f.name, 
                    status: 'ready', 
                    progress: 0,
                    error: null,
                    nfeData: null
                  }));
                  setImportFiles(mapped);
                }} 
              />
            </Button>

            {/* Informações do batch */}
            {importStatus && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                {/* Header do Status */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">Status da Importação</Typography>
                    <Chip 
                      label={
                        importStatus.status === 'processing' ? '🔄 Processando' :
                        importStatus.status === 'completed' ? '✅ Concluído' :
                        importStatus.status === 'completed_with_errors' ? '⚠️ Concluído com Erros' :
                        '❌ Erro'
                      }
                      color={
                        importStatus.status === 'processing' ? 'info' :
                        importStatus.status === 'completed' ? 'success' :
                        importStatus.status === 'completed_with_errors' ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </Stack>
                  {batchId && (
                    <Tooltip title="ID do Batch">
                      <Chip 
                        label={`Batch: ${batchId.substring(0, 8)}...`}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Stack>

                {/* Estatísticas */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">Total</Typography>
                      <Typography variant="h5" fontWeight="bold">{importStatus.totalFiles}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">Processados</Typography>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        {importStatus.processed}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">✅ Sucesso</Typography>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        {importStatus.successful}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block">❌ Falhas</Typography>
                      <Typography variant="h5" color="error.main" fontWeight="bold">
                        {importStatus.failed}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Barra de Progresso Detalhada */}
                <Box mb={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" fontWeight="medium">
                      Progresso: {importStatus.processed}/{importStatus.totalFiles}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                      {importStatus.progress}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={importStatus.progress || 0} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 2,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: importStatus.status === 'completed' ? 'success.main' :
                                importStatus.status === 'completed_with_errors' ? 'warning.main' :
                                importStatus.status === 'error' ? 'error.main' :
                                'primary.main'
                      }
                    }} 
                  />
                </Box>

                {/* Tempo Decorrido */}
                {importStatus.elapsedTime !== undefined && (
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                    <Typography variant="caption" color="text.secondary">
                      ⏱️ Tempo decorrido:
                    </Typography>
                    <Chip 
                      label={
                        importStatus.elapsedTime < 60 
                          ? `${importStatus.elapsedTime}s` 
                          : `${Math.floor(importStatus.elapsedTime / 60)}m ${importStatus.elapsedTime % 60}s`
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                )}

                {/* Mensagem de Conclusão */}
                {importStatus.status !== 'processing' && (
                  <Box 
                    mt={2} 
                    p={1.5} 
                    bgcolor={
                      importStatus.status === 'completed' ? 'success.lighter' :
                      importStatus.status === 'completed_with_errors' ? 'warning.lighter' :
                      'error.lighter'
                    }
                    borderRadius={1}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={
                        importStatus.status === 'completed' ? 'success.dark' :
                        importStatus.status === 'completed_with_errors' ? 'warning.dark' :
                        'error.dark'
                      }
                    >
                      {importStatus.status === 'completed' && 
                        `🎉 Importação concluída com sucesso! ${importStatus.successful} de ${importStatus.totalFiles} NFes importadas.`
                      }
                      {importStatus.status === 'completed_with_errors' && 
                        `⚠️ Importação concluída com erros: ${importStatus.successful} sucesso, ${importStatus.failed} falhas.`
                      }
                      {importStatus.status === 'error' && 
                        `❌ Erro no processamento do batch. Verifique os arquivos abaixo.`
                      }
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Barra de progresso geral */}
            {importing && importStatus && (
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                      Processando arquivos...
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    {importStatus.progress}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={importStatus.progress || 0} 
                  sx={{ height: 8, borderRadius: 1 }} 
                />
              </Box>
            )}

            {/* Lista de arquivos */}
            {importFiles && Array.isArray(importFiles) && importFiles.length > 0 && (
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense>
                  {importFiles.map((f, i) => {
                    // Verificações de segurança
                    if (!f || !f.file) return null;
                    
                    const getStatusColor = (status) => {
                      switch(status) {
                        case 'success': return 'success.main';
                        case 'failed': return 'error.main';
                        case 'processing': return 'info.main';
                        case 'skipped': return 'warning.main';
                        case 'pending': return 'grey.400';
                        default: return 'text.secondary';
                      }
                    };

                    const getStatusIcon = (status) => {
                      switch(status) {
                        case 'success': return '✅';
                        case 'failed': return '❌';
                        case 'processing': return '🔄';
                        case 'skipped': return '⏭️';
                        case 'pending': return '⏳';
                        default: return '📄';
                      }
                    };

                    const getStatusLabel = (status) => {
                      switch(status) {
                        case 'success': return 'Importado';
                        case 'failed': return 'Erro';
                        case 'processing': return 'Processando...';
                        case 'skipped': return 'Já importado';
                        case 'pending': return 'Aguardando';
                        default: return 'Pronto';
                      }
                    };

                    const getErrorTypeLabel = (errorType) => {
                      switch(errorType) {
                        case 'PARSE_ERROR': return '⚠️ XML Inválido';
                        case 'DUPLICATE': return '⏭️ Duplicado';
                        case 'VALIDATION_ERROR': return '❌ Validação Falhou';
                        case 'DATABASE_ERROR': return '� Erro no Banco';
                        case 'UNKNOWN_ERROR': return '⚠️ Erro Desconhecido';
                        default: return '❌ Erro';
                      }
                    };

                    return (
                      <React.Fragment key={`file-${i}-${f.filename || 'unknown'}`}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" component="span">
                                  {getStatusIcon(f.status)}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
                                  {f.filename || f.file.name || 'Arquivo sem nome'}
                                </Typography>
                                <Chip 
                                  label={getStatusLabel(f.status)}
                                  size="small"
                                  sx={{ 
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: getStatusColor(f.status),
                                    color: 'white'
                                  }}
                                />
                                {!importing && (f.status === 'ready' || f.status === 'failed') && (
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => {
                                      setImportFiles(prev => prev.filter((_, idx) => idx !== i));
                                    }}
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteOutlined style={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                              </Stack>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                            secondary={
                              <Box mt={0.5}>
                                {/* Barra de progresso individual */}
                                {f.status === 'processing' && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={f.progress || 50} 
                                    sx={{ height: 4, borderRadius: 1, mb: 0.5 }} 
                                  />
                                )}

                                {/* Informações da NFe */}
                                {f.nfeData && f.status === 'success' && (
                                  <Box sx={{ p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, mt: 0.5 }}>
                                    <Stack spacing={1}>
                                      {/* Header da NFe */}
                                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Chip 
                                            label={`NFe ${f.nfeData.nfeNumber || '-'}`}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                          />
                                          {f.nfeData.nfeKey && (
                                            <Tooltip title={`Chave: ${f.nfeData.nfeKey}`}>
                                              <Chip 
                                                label={`${f.nfeData.nfeKey.substring(0, 8)}...`}
                                                size="small"
                                                variant="outlined"
                                              />
                                            </Tooltip>
                                          )}
                                        </Stack>
                                        {f.nfeData.issueDate && (
                                          <Typography variant="caption" color="text.secondary">
                                            {dayjs(f.nfeData.issueDate).format('DD/MM/YYYY')}
                                          </Typography>
                                        )}
                                      </Stack>

                                      {/* Detalhes do Fornecedor */}
                                      {(f.nfeData.supplier || f.nfeData.supplierCNPJ) && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Fornecedor:</Typography>
                                          <Typography variant="caption" fontWeight="bold" display="block">
                                            {f.nfeData.supplier || '-'}
                                            {f.nfeData.supplierCNPJ && ` (CNPJ: ${f.nfeData.supplierCNPJ})`}
                                          </Typography>
                                        </Box>
                                      )}

                                      {/* Grid de Informações */}
                                      <Grid container spacing={1}>
                                        {f.nfeData.totalValue !== undefined && (
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Valor Total:</Typography>
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                              R$ {Number(f.nfeData.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </Typography>
                                          </Grid>
                                        )}
                                        {f.nfeData.itemsCount !== undefined && (
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Itens:</Typography>
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                              {f.nfeData.itemsCount} produtos
                                            </Typography>
                                          </Grid>
                                        )}
                                      </Grid>

                                      {/* Resumo do Processamento */}
                                      <Box sx={{ pt: 0.5, borderTop: '1px solid', borderColor: 'success.light' }}>
                                        <Typography variant="caption" color="success.dark" fontWeight="medium">
                                          ✓ {f.nfeData.productsCreated || 0} novos | 
                                          ↻ {f.nfeData.productsUpdated || 0} atualizados | 
                                          📦 {f.nfeData.lotsCreated || 0} lotes criados
                                        </Typography>
                                        {f.nfeData.totalLotValue && (
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Valor em estoque: R$ {Number(f.nfeData.totalLotValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Stack>
                                  </Box>
                                )}

                                {/* NFe Pulada (Duplicada) */}
                                {f.nfeData && f.status === 'skipped' && (
                                  <Box sx={{ p: 1.5, bgcolor: 'warning.lighter', borderRadius: 1, mt: 0.5 }}>
                                    <Stack spacing={0.5}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="caption" fontWeight="bold" color="warning.dark">
                                          ⏭️ NFe já importada anteriormente
                                        </Typography>
                                      </Stack>
                                      {f.nfeData.nfeKey && (
                                        <Typography variant="caption" color="text.secondary">
                                          Chave: {f.nfeData.nfeKey}
                                        </Typography>
                                      )}
                                      {f.nfeData.nfeNumber && (
                                        <Typography variant="caption" color="text.secondary">
                                          Número: {f.nfeData.nfeNumber}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                )}

                                {/* Mensagem de erro */}
                                {f.error && f.status === 'failed' && (
                                  <Box sx={{ p: 1.5, bgcolor: 'error.lighter', borderRadius: 1, mt: 0.5 }}>
                                    <Stack spacing={0.5}>
                                      {f.errorType && (
                                        <Chip 
                                          label={getErrorTypeLabel(f.errorType)}
                                          size="small"
                                          color="error"
                                          sx={{ width: 'fit-content' }}
                                        />
                                      )}
                                      <Typography variant="caption" color="error.dark">
                                        {f.error}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                )}

                                {/* Status de espera */}
                                {f.status === 'ready' && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Pronto para enviar
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {i < importFiles.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  }).filter(Boolean)}
                </List>
              </Paper>
            )}

            {/* Avisos e dicas */}
            {!importing && importFiles.length === 0 && !importStatus && (
              <Box sx={{ p: 3, bgcolor: 'info.lighter', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="info.dark" gutterBottom>
                  📋 Como Importar NFes
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>💡 Dicas Importantes:</strong>
                </Typography>
                <Stack spacing={0.5} alignItems="flex-start" sx={{ maxWidth: 500, mx: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    • Você pode selecionar até <strong>50 arquivos XML</strong> por vez
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Tamanho máximo de <strong>10MB</strong> por arquivo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • NFes duplicadas serão <strong>automaticamente ignoradas</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Produtos e lotes de custo serão <strong>criados/atualizados automaticamente</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • O processamento é <strong>assíncrono</strong> - você pode fechar esta janela
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            key="cancel-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!importing && !uploadingRef.current) {
                requestAnimationFrame(() => {
                  handleCloseImportDialog();
                });
              }
            }} 
            disabled={importing || uploadingRef.current}
          >
            {importing ? 'Fechar' : 'Cancelar'}
          </Button>
          {importing ? (
            <Button 
              key="stop-btn"
              color="warning" 
              variant="outlined"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                requestAnimationFrame(() => {
                  handleCancelImport();
                });
              }}
            >
              Parar Processamento
            </Button>
          ) : (
            <Button 
              key="upload-btn"
              variant="contained" 
              startIcon={<UploadOutlined />}
              disabled={importFiles.length === 0 || importing || uploadingRef.current} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!uploadingRef.current && !importing) {
                  handleUploadNFes();
                }
              }}
            >
              Enviar {importFiles.length > 0 ? `(${importFiles.length})` : ''}
            </Button>
          )}
        </DialogActions>
      </Dialog>
        </DialogErrorBoundary>
      )}

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
