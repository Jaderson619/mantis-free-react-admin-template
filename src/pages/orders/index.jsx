import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

// material-ui
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Typography,
  Button,
  IconButton,
  Pagination,
  Stack,
  Checkbox,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip
} from '@mui/material';

// ant design icons (substituindo os ícones Material)
import PrinterOutlined from '@ant-design/icons/PrinterOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import CommentOutlined from '@ant-design/icons/CommentOutlined';
import StarOutlined from '@ant-design/icons/StarOutlined';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';
import ShakeOutlined from '@ant-design/icons/ShakeOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import DropboxOutlined from '@ant-design/icons/DropboxOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';

// project import
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';

// ==============================|| PEDIDOS ||============================== //

export default function OrdersPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(40);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/orders/db', {
        params: { page, limit: rowsPerPage }
      });
      console.log('📦 Resposta completa da API:', response.data);

      // Nova estrutura: response.data.data.orders
      const apiData = response.data?.data || response.data;
      let rawOrders = apiData?.orders || [];
      
      if (!Array.isArray(rawOrders)) rawOrders = [rawOrders];
      
      console.log('📋 Raw orders extraídos:', rawOrders);
      console.log('🔢 Quantidade de pedidos:', rawOrders.length);

      // Helper para números seguros
      const num = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      // Nova estrutura: cada order pode ter múltiplos items
      const transformedOrders = rawOrders.flatMap((order) => {
        try {
          console.log('🔍 Processando pedido:', {
            id: order.id,
            orderNumber: order.orderNumber,
            totalPaidByCustomer: order.totalPaidByCustomer,
            shippingCost: order.shippingCost,
            sellerShippingCost: order.sellerShippingCost,
            marketplaceFee: order.marketplaceFee,
            totalProductCost: order.totalProductCost,
            netProfit: order.netProfit,
            itemCount: order.itemCount,
            items: order.items?.length
          });

          const orderDate = order.orderDate ? dayjs(order.orderDate) : dayjs();
          const orderStatus = order.status || 'pending';
          
          // Extrair informações do comprador
          const customerName = order.buyer?.name || order.buyerNickname || order.customerName || 'Cliente não informado';
          const customerEmail = order.buyer?.email || '';
          
          // Processar cada item do pedido
          const items = Array.isArray(order.items) ? order.items : [];
          
          if (items.length === 0) {
            console.warn('⚠️ Pedido sem items:', order.orderNumber);
            return [];
          }

          return items.map((item, index) => {
            console.log('  📦 Item:', {
              sku: item.product?.sku,
              name: item.product?.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              productCost: item.productCost,
              itemTotalCost: item.itemTotalCost
            });

            const quantity = num(item.quantity || 1);
            const unitPrice = num(item.unitPrice);
            const totalPrice = num(item.totalPrice || (unitPrice * quantity));
            
            // ===== NOVOS CAMPOS DA API =====
            // Valores financeiros do pedido (nível order)
            const totalPaidByCustomer = num(order.totalPaidByCustomer || totalPrice);
            const shippingCost = num(order.shippingCost || 0);
            const sellerShippingCost = num(order.sellerShippingCost || 0);
            const marketplaceFee = num(order.marketplaceFee || 0);
            const grossRevenue = num(order.grossRevenue || 0);
            const taxAmount = num(order.taxAmount || 0);
            const totalProductCost = num(order.totalProductCost || 0);
            const netProfit = num(order.netProfit || 0);
            
            // Identificar quem paga o frete
            const shippingPaidBy = sellerShippingCost > 0 ? 'seller' : 'customer';
            const shippingLabel = shippingPaidBy === 'seller' 
              ? `Frete (Vendedor)`
              : `Frete (Cliente)`;
            const actualShippingCost = shippingPaidBy === 'seller' 
              ? sellerShippingCost 
              : shippingCost;
            
            // Custos do item (nível item)
            const productCost = num(item.productCost || 0);
            const lotCost = num(item.lotCost || 0);
            const itemTotalCost = num(item.itemTotalCost || productCost * quantity);
            
            // Cálculos de margem
            const profitMargin = totalPaidByCustomer > 0 
              ? ((netProfit / totalPaidByCustomer) * 100).toFixed(2) 
              : '0.00';

            return {
              id: `#${order.orderNumber}-${item.id || index}`,
              customer: customerName,
              customerId: order.orderNumber || order.id?.toString() || '',
              product: item.product?.name || item.title || 'Produto não informado',
              sku: item.product?.sku || item.sku || '-',
              
              // ===== VALORES FINANCEIROS ATUALIZADOS =====
              totalPaidByCustomer,      // Total pago pelo cliente
              totalValue: totalPrice,   // Valor do item
              shippingCost,             // Frete (pago pelo cliente)
              sellerShippingCost,       // Frete (pago pelo vendedor)
              shippingPaidBy,           // Quem paga o frete: 'seller' ou 'customer'
              shippingLabel,            // Label formatada: "Frete (Vendedor)" ou "Frete (Cliente)"
              actualShippingCost,       // Custo real do frete
              marketplaceFee,           // Taxa Mercado Livre
              grossRevenue,             // Receita bruta (total - frete - taxa)
              taxAmount,                // Imposto (8%)
              totalProductCost,         // Custo total dos produtos
              productCost,              // Custo unitário do produto
              itemTotalCost,            // Custo total deste item
              netProfit,                // Lucro líquido
              profitMargin,             // Margem de lucro %
              
              // Campos legados (mantidos para compatibilidade)
              fees: {
                marketplace: marketplaceFee,
                shipping: shippingCost,
                total: marketplaceFee + shippingCost
              },
              netValue: grossRevenue,
              commissionCost: marketplaceFee,
              profit: netProfit,
              profitPercentage: `${profitMargin}%`,
              
              date: orderDate.format('DD/MM/YYYY'),
              time: orderDate.format('HH:mm'),
              status: orderStatus,
              shippingStatus: order.shippingStatus || orderStatus,
              address: order.shippingAddress || order.customerZip || customerEmail || '-',
              estimatedDelivery: order.estimatedDelivery 
                ? dayjs(order.estimatedDelivery).format('DD/MM/YYYY')
                : orderDate.add(3, 'day').format('DD/MM/YYYY'),
              quantity,
              imageUrl: item.listing?.thumbnail || item.thumbnail || order.thumbnail || 'https://via.placeholder.com/60'
            };
          });
        } catch (err) {
          console.error('❌ Erro ao processar pedido:', err, order);
          console.error('📄 Estrutura do pedido:', JSON.stringify(order, null, 2));
          return [];
        }
      }).filter(Boolean); // Remove nulls e arrays vazios

      console.log('✅ Pedidos transformados:', transformedOrders);
      console.log('📊 Total de linhas:', transformedOrders.length);
      setOrders(transformedOrders);

      // Paginação da nova API
      const pagination = apiData?.pagination || {};
      const totalRecords = pagination.total || rawOrders.length;
      const calculatedTotalPages = pagination.totalPages || Math.ceil(totalRecords / rowsPerPage);
      
      setTotalPages(calculatedTotalPages);
      console.log('📄 Paginação:', { total: totalRecords, pages: calculatedTotalPages });
    } catch (error) {
      console.error('❌ ERRO ao carregar pedidos:', error);
      console.error('📋 Detalhes do erro:', error.response?.data || error.message);
      setOrders([]); // Garante array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getStatusChip = (status, shippingStatus) => {
    if (status === 'waiting') {
      return (
        <Chip 
          icon={<CarOutlined />} 
          label="Aguardando Envio"
          sx={{ 
            bgcolor: theme.palette.error.lighter,
            color: theme.palette.error.dark,
            fontWeight: 600
          }}
        />
      );
    } else if (shippingStatus === 'authorized') {
      return (
        <Chip 
          icon={<CarOutlined />} 
          label="NF-e Autorizada"
          sx={{ 
            bgcolor: theme.palette.success.lighter,
            color: theme.palette.success.dark,
            fontWeight: 600
          }}
        />
      );
    }
    return null;
  };

  // Calcular totais para os cards de resumo
  const calculateSummary = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPaidByCustomer, 0);
    const totalCosts = orders.reduce((sum, order) => sum + order.totalProductCost + order.taxAmount, 0);
    const totalProfit = orders.reduce((sum, order) => sum + order.netProfit, 0);
    const averageMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0.00';

    return { totalRevenue, totalCosts, totalProfit, averageMargin };
  };

  const summary = calculateSummary();

  return (
    <>
      {/* Cards de Resumo Financeiro */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Receita Total
              </Typography>
              <Typography variant="h4" color="success.main">
                R$ {summary.totalRevenue.toFixed(2)}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Custos Totais
              </Typography>
              <Typography variant="h4" color="error.main">
                R$ {summary.totalCosts.toFixed(2)}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Lucro Total
              </Typography>
              <Typography variant="h4" color={summary.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                R$ {summary.totalProfit.toFixed(2)}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Margem Média
              </Typography>
              <Typography variant="h4" color={summary.averageMargin >= 0 ? 'info.main' : 'error.main'}>
                {summary.averageMargin}%
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" component="div" mr={2}>
              Pedidos {orders.length > 0 && `(${orders.length})`}
            </Typography>
            <TextField
              placeholder="Buscar pedidos..."
              size="small"
              InputProps={{
                startAdornment: <SearchOutlined style={{ marginRight: 8 }} />
              }}
              sx={{ width: '300px', mr: 2 }}
            />
            <FormControl size="small" sx={{ width: '120px' }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                defaultValue="all"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="waiting">Aguardando</MenuItem>
                <MenuItem value="shipped">Enviados</MenuItem>
                <MenuItem value="delivered">Entregues</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            startIcon={<UnorderedListOutlined />} 
            variant="contained" 
            color="primary" 
            sx={{ mr: 1 }}
          >
            Legendas
          </Button>
          <Button 
            startIcon={<CopyOutlined />} 
            variant="outlined" 
            sx={{ mr: 1 }}
          >
            Opções de Desempenho
          </Button>
          <Button 
            startIcon={<PrinterOutlined />} 
            variant="contained" 
            color="primary" 
            sx={{ mr: 1 }}
          >
            Imprimir
          </Button>
          <IconButton color="primary" onClick={fetchOrders} disabled={loading}>
            <ReloadOutlined />
          </IconButton>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>Info</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Valores Financeiros</TableCell>
                <TableCell>Entrega</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">Carregando pedidos...</Typography>
                      <Typography variant="body2" color="text.secondary">Por favor, aguarde</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <UnorderedListOutlined style={{ fontSize: '3rem', opacity: 0.3 }} />
                      <Typography variant="h6">Nenhum pedido encontrado</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verifique os filtros ou tente recarregar a página
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<ReloadOutlined />} 
                        onClick={fetchOrders}
                        sx={{ mt: 2 }}
                      >
                        Recarregar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                >
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{order.customer}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customerId}</Typography>
                      <Box mt={0.5}>
                        <Typography variant="caption" display="block">
                          Venda: {order.id}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {order.address}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Data: {order.date} - {order.time}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        backgroundImage: `url(${order.imageUrl})`, 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: 60, 
                        height: 60,
                        mr: 1,
                        border: '1px solid #eee',
                        borderRadius: 1
                      }} />
                      <Box>
                        <Box sx={{ 
                          display: 'inline-block',
                          bgcolor: theme.palette.warning.main,
                          color: '#fff',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          mb: 0.5
                        }}>
                          {order.quantity}x
                        </Box>
                        <Typography variant="body2">{order.product}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" mr={1}>
                            SKU: {order.sku}
                          </Typography>
                          <SearchOutlined style={{ fontSize: '0.875rem', color: theme.palette.primary.main }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                          {order.quantity} {order.quantity > 1 ? 'disponíveis' : 'disponível'} após esta venda
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 220 }}>
                      {/* Total Pago pelo Cliente */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCardOutlined style={{ fontSize: '1rem', color: theme.palette.success.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Total Pago:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          R$ {order.totalPaidByCustomer.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {/* Frete - Dinâmico baseado em quem paga */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TruckOutlined style={{ 
                          fontSize: '1rem', 
                          color: order.shippingPaidBy === 'seller' 
                            ? theme.palette.error.main 
                            : theme.palette.text.secondary 
                        }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          {order.shippingLabel}:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={order.shippingPaidBy === 'seller' ? 'error.main' : 'text.secondary'}
                          fontWeight={order.shippingPaidBy === 'seller' ? 'medium' : 'normal'}
                        >
                          {order.shippingPaidBy === 'seller' ? '-' : ''}R$ {order.actualShippingCost.toFixed(2)}
                        </Typography>
                        {order.shippingPaidBy === 'seller' && (
                          <Chip 
                            label="Custo" 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem',
                              bgcolor: theme.palette.error.lighter || 'rgba(244, 67, 54, 0.08)',
                              color: theme.palette.error.main,
                              fontWeight: 600
                            }} 
                          />
                        )}
                      </Box>
                      
                      {/* Taxa Mercado Livre */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShakeOutlined style={{ fontSize: '1rem', color: theme.palette.warning.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Taxa ML:
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                          -R$ {order.marketplaceFee.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {/* Receita Bruta */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WalletOutlined style={{ fontSize: '1rem', color: theme.palette.info.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Bruto:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="info.main">
                          R$ {order.grossRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {/* Custo dos Produtos */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DropboxOutlined style={{ fontSize: '1rem', color: theme.palette.error.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Custos:
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          -R$ {order.totalProductCost.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {/* Impostos */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RiseOutlined style={{ fontSize: '1rem', color: theme.palette.secondary.main }} />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                          Impostos:
                        </Typography>
                        <Typography variant="body2" color="secondary.main">
                          -R$ {order.taxAmount.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {/* Lucro Líquido */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        bgcolor: order.netProfit >= 0 
                          ? (theme.palette.success.lighter || 'rgba(76, 175, 80, 0.08)')
                          : (theme.palette.error.lighter || 'rgba(244, 67, 54, 0.08)'),
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        mt: 0.5
                      }}>
                        <GoldOutlined style={{ 
                          fontSize: '1rem', 
                          color: order.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main 
                        }} />
                        <Typography 
                          variant="caption" 
                          color={order.netProfit >= 0 ? 'success.main' : 'error.main'} 
                          fontWeight="medium" 
                          sx={{ minWidth: 80 }}
                        >
                          Lucro:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={order.netProfit >= 0 ? 'success.main' : 'error.main'}
                        >
                          R$ {order.netProfit.toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={order.netProfit >= 0 ? 'success.main' : 'error.main'} 
                          sx={{ ml: 'auto' }}
                        >
                          ({order.profitMargin}%)
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">
                        Estimativa De Entrega: 
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.estimatedDelivery}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(order.status, order.shippingStatus)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary">
                        <MessageOutlined />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <CommentOutlined />
                      </IconButton>
                      <IconButton size="small">
                        <StarOutlined />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <UnorderedListOutlined />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteOutlined />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ py: 2, px: 2 }}
        >
          <FormControl variant="outlined" size="small" sx={{ minWidth: 70 }}>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              displayEmpty
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handleChangePage} 
            color="primary"
            showFirstButton
            showLastButton
            shape="rounded"
          />
        </Stack>
      </Paper>
    </>
  );
}