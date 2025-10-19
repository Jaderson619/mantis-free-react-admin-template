import PropTypes from 'prop-types';
// material-ui
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// project import
import Dot from 'components/@extended/Dot';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'orderId', align: 'left', disablePadding: false, label: 'Order ID' },
  { id: 'orderDate', align: 'right', disablePadding: false, label: 'Data da venda' },
  { id: 'productName', align: 'left', disablePadding: false, label: 'Nome do produto' },
  { id: 'sku', align: 'left', disablePadding: false, label: 'SKU' },
  { id: 'unitPrice', align: 'right', disablePadding: false, label: 'Preço por unidade' },
  { id: 'quantity', align: 'left', disablePadding: false, label: 'Quantidade' },
  { id: 'revenue', align: 'left', disablePadding: false, label: 'Receita (T)' },
  { id: 'cost', align: 'left', disablePadding: false, label: 'Custo (-)' },
  { id: 'governmentTax', align: 'left', disablePadding: false, label: 'Imposto (-)' },
  { id: 'salesTax', align: 'left', disablePadding: false, label: 'Tarifa de venda (-)' },
  { id: 'shippingBuyer', align: 'left', disablePadding: false, label: 'Frete comprador (-)' },
  { id: 'shippingSeller', align: 'left', disablePadding: false, label: 'Frete seller (-)' },
  { id: 'contributionMargin', align: 'left', disablePadding: false, label: 'Margem contribuição (=)' },
  { id: 'cmPercentage', align: 'left', disablePadding: false, label: 'MC em %' }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable() {
  const [orders, setOrders] = useState([]); // Estado para armazenar os pedidos
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null); // Estado de erro

  // useEffect para buscar dados quando o componente for montado
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/orders/db');
        // A API retorna uma lista de pedidos já no formato esperado
        let data = response.data?.data?.orders ?? response.data?.orders ?? response.data ?? [];
        if (!Array.isArray(data)) data = [data];
        setOrders(data);
      } catch (err) {
        setError('Erro ao carregar os dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const order = 'asc';
  const orderBy = 'orderId';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Renderizar o estado de carregamento
  if (loading) return <Box>Carregando...</Box>;

  // Renderizar o estado de erro
  if (error) return <Box>{error}</Box>;

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {Array.isArray(orders) && orders.length > 0 ? (
              stableSort(orders, getComparator(order, orderBy)).flatMap((orderObj) => {
                const items = Array.isArray(orderObj.items) ? orderObj.items : [];
                if (items.length === 0) {
                  return (
                    <TableRow key={`${orderObj.orderId}-noitems`} hover>
                      <TableCell>{orderObj.orderId || '-'}</TableCell>
                      <TableCell align="right">{orderObj.date ? new Date(orderObj.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell colSpan={headCells.length - 2}>
                        <Typography variant="caption" color="text.secondary">Sem itens</Typography>
                      </TableCell>
                    </TableRow>
                  );
                }
                return items.map((item, idx) => {
                  const unitPrice = Number(item.unit_price || 0);
                  const quantity = Number(item.quantity || 0);
                  const revenueOrder = Number(orderObj.totalAmount || orderObj.paidAmount || 0);
                  // Placeholders para campos ainda não fornecidos pelo backend
                  const costTotal = 0;
                  const governmentTax = 0;
                  const salesTax = 0;
                  const shippingBuyer = 0;
                  const shippingSeller = 0;
                  const contributionMargin = revenueOrder - (costTotal + governmentTax + salesTax + shippingSeller);
                  const cmPerc = revenueOrder > 0 ? (contributionMargin / revenueOrder) * 100 : 0;
                  return (
                    <TableRow key={`${orderObj.orderId}-${idx}`} hover>
                      <TableCell>{orderObj.orderId || '-'}</TableCell>
                      <TableCell align="right">{orderObj.date ? new Date(orderObj.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{item.productName || item.title || '-'}</TableCell>
                      <TableCell>
                        <Link color="secondary">{item.sku || '-'}</Link>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(unitPrice)}</TableCell>
                      <TableCell>{quantity}</TableCell>
                      <TableCell>{formatCurrency(revenueOrder)}</TableCell>
                      <TableCell>{formatCurrency(costTotal)}</TableCell>
                      <TableCell>{governmentTax ? formatCurrency(governmentTax) : '-'}</TableCell>
                      <TableCell>{salesTax ? formatCurrency(salesTax) : '-'}</TableCell>
                      <TableCell>{shippingBuyer ? formatCurrency(shippingBuyer) : '-'}</TableCell>
                      <TableCell>{shippingSeller ? formatCurrency(shippingSeller) : '-'}</TableCell>
                      <TableCell>{formatCurrency(contributionMargin)}</TableCell>
                      <TableCell>{cmPerc.toFixed(2)}%</TableCell>
                    </TableRow>
                  );
                });
              })
            ) : (
              <TableRow>
                <TableCell colSpan={headCells.length}>
                  <Typography align="center" color="text.secondary">Nenhum pedido encontrado</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };
