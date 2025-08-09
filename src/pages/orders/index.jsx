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
      const response = await axios.get('http://localhost:5001/api/orders/marketplace/db', {
        params: { page, limit: rowsPerPage }
      });
      console.log('Dados da API (marketplace):', response.data);

      // Suporta tanto { orders: [...] } quanto array direto
      let rawOrders = response.data?.orders ?? response.data ?? [];
      if (!Array.isArray(rawOrders)) rawOrders = [rawOrders];

      // Transformar cada pedido em linhas por item agrupado (mesmo sku + productName)
      const transformedOrders = rawOrders.flatMap(order => {
        try {
          const items = Array.isArray(order.items) ? order.items : [];
          const grouped = {};
            items.forEach(it => {
            const key = `${it.sku}-${it.productName || it.title}`;
            if (!grouped[key]) {
              grouped[key] = { ...it, quantity: 0 };
            }
            grouped[key].quantity += Number(it.quantity || 0);
          });

          const orderDate = order.date ? dayjs(order.date) : dayjs();
          const orderStatus = order.status || 'pending';

          return Object.values(grouped).map(it => {
            const unitPrice = Number(it.unit_price || it.unitPrice || 0);
            const quantity = Number(it.quantity || 0);
            const lineRevenue = unitPrice * quantity; // receita por item agrupado
            // Como não temos custos/taxas detalhados nesse payload, placeholders 0
            const shipping = 0;
            const marketplaceFee = 0;
            const netValue = lineRevenue - shipping - marketplaceFee;
            const profit = 0; // Sem custo para calcular margem real
            const profitPercentage = '0%';

            return {
              id: `#${order.orderId || ''}`,
              customer: 'Cliente',
              customerId: order.orderId || '',
              product: it.productName || it.title || 'Produto não informado',
              sku: it.sku || 'SKU não informado',
              totalValue: lineRevenue,
              fees: {
                marketplace: marketplaceFee,
                shipping: shipping,
                total: marketplaceFee + shipping
              },
              netValue,
              shippingCost: shipping,
              commissionCost: 0,
              profit,
              profitPercentage,
              date: orderDate.format('DD/MM/YYYY'),
              time: orderDate.format('HH:mm'),
              status: orderStatus,
              shippingStatus: orderStatus,
              address: 'CEP: Não informado',
              estimatedDelivery: orderDate.add(3, 'day').format('DD/MM/YYYY'),
              quantity,
              imageUrl: 'https://via.placeholder.com/60'
            };
          });
        } catch (err) {
          console.error('Erro ao processar pedido (marketplace):', err, order);
          return [];
        }
      });

      console.log('Pedidos transformados (marketplace):', transformedOrders);
      setOrders(transformedOrders);

      const totalRecords = response.data.total || rawOrders.length;
      setTotalPages(Math.ceil(totalRecords / rowsPerPage));
    } catch (error) {
      console.error('Erro ao carregar os pedidos (marketplace):', error);
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

  return (
    <>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" component="div" mr={2}>
              Pedidos
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
          <IconButton color="primary">
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
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Taxas</TableCell>
                <TableCell align="right">Líquido</TableCell>
                <TableCell align="right">Frete</TableCell>
                <TableCell align="right">Comissão</TableCell>
                <TableCell align="right">Lucro</TableCell>
                <TableCell>Entrega</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
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
                  <TableCell align="right">
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      R$ {order.totalValue.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">-R$ {order.fees.marketplace.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">-R$ {order.fees.shipping.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="primary.main">
                      R$ {order.netValue.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      -R$ {order.shippingCost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      -R$ {order.commissionCost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      R$ {order.profit.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      ({order.profitPercentage})
                    </Typography>
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
              ))}
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