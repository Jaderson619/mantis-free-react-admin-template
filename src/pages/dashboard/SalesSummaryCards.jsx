// components/cards/SalesSummaryCards.js

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Grid, Typography } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import axios from 'axios';

function SalesSummaryCards({ startDate, endDate, applyFilter }) {
  const [resumoVendas, setResumoVendas] = useState(null);

  useEffect(() => {
    async function fetchResumoVendas() {
      try {
  // Garantir que o intervalo enviado cubra o dia completo em horário local (00:00:00 até 23:59:59)
  const start = dayjs(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const end = dayjs(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  const url = `http://localhost:5001/api/reports/salesSummary/?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&status=paid`;
  
  console.log('🔍 [SalesSummaryCards] Buscando dados:', {
    startDate: start,
    endDate: end,
    url
  });
  
  const response = await axios.get(url);
  console.log('📦 [SalesSummaryCards] Resposta da API:', response.data);
  
        const data = response.data.resumoVendas;
        
        if (!data) {
          console.warn('⚠️ [SalesSummaryCards] Nenhum dado retornado em response.data.resumoVendas');
          console.log('📋 [SalesSummaryCards] Estrutura completa da resposta:', JSON.stringify(response.data, null, 2));
          return;
        }
        const resumo = {
          receitaTotalVendasAprovadas: parseFloat(data.receitaTotalVendasAprovadas) || 0,
          totalCustoImposto: parseFloat(data.totalCustoImposto) || 0,
          totalTarifasVenda: parseFloat(data.totalTarifasVenda) || 0,
          totalFrete: parseFloat(data.totalFrete || 0),
          totalMargemContribuicao: parseFloat(data.totalMargemContribuicao) || 0,
          quantidadeVendasAprovadas: parseInt(data.quantidadeVendasAprovadas, 10) || 0,
          ticketMedio: parseFloat(data.ticketMedio) || 0,
          ticketMedioMargem: parseFloat(data.ticketMedioMargem) || 0
        };
        
        console.log('✅ [SalesSummaryCards] Dados processados:', resumo);
        setResumoVendas(resumo);
      } catch (error) {
        console.error('❌ [SalesSummaryCards] Erro ao buscar o resumo de vendas:', error);
        console.error('📋 [SalesSummaryCards] Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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
