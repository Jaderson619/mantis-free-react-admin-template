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
        const response = await axios.get('http://localhost:5001/api/orders/db'); // URL da sua API
        setOrders(response.data.orders || []); // Armazena os dados em "orders" ou um array vazio
        setLoading(false); // Finaliza o estado de carregamento
      } catch (err) {
        setError('Erro ao carregar os dados');
        setLoading(false); // Finaliza o estado de carregamento em caso de erro
      }
    };

    fetchOrders(); // Chama a função ao montar o componente
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
            {Array.isArray(orders) &&
              stableSort(orders, getComparator(order, orderBy)).map((orderList) => (
                orderList.orderItems.map((item, itemIndex) => (
                  <TableRow key={`${orderList.orderId}-${itemIndex}`} hover role="checkbox">
                    <TableCell>{orderList.orderId}</TableCell>
                    <TableCell align="right">{new Date(orderList.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <Link color="secondary">{item.productSku}</Link>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.itemPrice)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(orderList.revenue)}</TableCell>
                    <TableCell>{formatCurrency(item.itemCostPrice)}</TableCell>
                    <TableCell>{/* Imposto futuro */}</TableCell>
                    <TableCell>{/* Tarifa de venda futura */}</TableCell>
                    <TableCell>{/* Frete comprador futuro */}</TableCell>
                    <TableCell>{/* Frete seller futuro */}</TableCell>
                    <TableCell>{/* Margem de contribuição futura */}</TableCell>
                    <TableCell>{/* MC % futura */}</TableCell>
                  </TableRow>
                ))
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };
