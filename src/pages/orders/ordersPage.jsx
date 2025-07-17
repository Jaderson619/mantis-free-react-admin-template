import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Importando componentes do Material Mantis/MUI
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);  // Estado para armazenar os pedidos
  const [loading, setLoading] = useState(true);  // Estado de carregamento
  const [error, setError] = useState(null);  // Estado de erro

  useEffect(() => {
    // Função para buscar os pedidos do back-end
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/orders');  // URL da sua API
        setOrders(response.data);  // Armazena os dados no estado 'orders'
        setLoading(false);  // Desativa o estado de carregamento
      } catch (err) {
        setError('Erro ao carregar os dados');
        setLoading(false);
      }
    };

    fetchOrders();  // Chama a função ao montar o componente
  }, []);

  // Renderizar a tabela com os dados
  if (loading) {
    return <CircularProgress />;  // Exibe o indicador de carregamento
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;  // Exibe mensagem de erro
  }

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" gutterBottom>
        Lista de Pedidos
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Nome do Item</strong></TableCell>
            <TableCell><strong>SKU</strong></TableCell>
            <TableCell><strong>Data</strong></TableCell>
            <TableCell><strong>Frete</strong></TableCell>
            <TableCell><strong>Valor do Item</strong></TableCell>
            <TableCell><strong>Quantidade</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={index}>
              <TableCell>{order.itemName}</TableCell>
              <TableCell>{order.sku}</TableCell>
              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
              <TableCell>{order.shipping > 0 ? `R$ ${order.shipping.toFixed(2)}` : 'Grátis'}</TableCell>
              <TableCell>R$ {order.itemPrice.toFixed(2)}</TableCell>
              <TableCell>{order.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderTable;
