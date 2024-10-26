// components/cards/SalesSummaryCards.js

import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import axios from 'axios';

function SalesSummaryCards({ startDate, endDate, applyFilter }) {
  const [resumoVendas, setResumoVendas] = useState(null);

  useEffect(() => {
    async function fetchResumoVendas() {
      try {
        const response = await axios.get(`http://localhost:5001/api/reports/salesSummary/?startDate=${startDate}&endDate=${endDate}&status=paid`);
        const data = response.data.resumoVendas;
        setResumoVendas({
          receitaTotalVendasAprovadas: parseFloat(data.receitaTotalVendasAprovadas),
          totalCustoImposto: parseFloat(data.totalCustoImposto),
          totalTarifasVenda: parseFloat(data.totalTarifasVenda),
          totalFrete: parseFloat(data.totalFrete || 0),
          totalMargemContribuicao: parseFloat(data.totalMargemContribuicao),
          quantidadeVendasAprovadas: parseInt(data.quantidadeVendasAprovadas, 10),
          ticketMedio: parseFloat(data.ticketMedio),
          ticketMedioMargem: parseFloat(data.ticketMedioMargem)
        });
      } catch (error) {
        console.error('Erro ao buscar o resumo de vendas:', error);
      }
    }

    fetchResumoVendas();
  }, [applyFilter, startDate, endDate]);

  if (!resumoVendas) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Receita Total Vendas Aprovadas"
          count={`R$ ${resumoVendas.receitaTotalVendasAprovadas.toLocaleString()}`}
          percentage={59.3}
          extra="35,000"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Custo e Imposto"
          count={`R$ ${resumoVendas.totalCustoImposto.toLocaleString()}`}
          percentage={70.5}
          extra="8,900"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Tarifas de Vendas"
          count={`R$ ${resumoVendas.totalTarifasVenda.toLocaleString()}`}
          percentage={27.4}
          isLoss
          color="warning"
          extra="1,943"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Frete"
          count={`R$ ${resumoVendas.totalFrete.toLocaleString()}`}
          percentage={27.4}
          isLoss
          color="warning"
          extra="20,395"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Margem Contribuição"
          count={`R$ ${resumoVendas.totalMargemContribuicao.toLocaleString()}`}
          percentage={27.4}
          extra="15,000"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Quantidade Vendas Aprovadas"
          count={resumoVendas.quantidadeVendasAprovadas.toLocaleString()}
          percentage={59.3}
          extra="1,357"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Ticket Médio por Venda"
          count={`R$ ${resumoVendas.ticketMedio.toLocaleString()}`}
          percentage={70.5}
          extra="900"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Ticket Médio Margem Contribuição"
          count={`R$ ${resumoVendas.ticketMedioMargem.toLocaleString()}`}
          percentage={27.4}
          extra="400"
        />
      </Grid>
    </>
  );
}

export default SalesSummaryCards;
