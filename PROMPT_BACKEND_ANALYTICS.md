# Specificação para Análise/Métricas Individuais do Produto

O Frontend precisa de um novo endpoint para alimentar o Dashboard de Análise de Produto (`/produtos/analise`). Este dashboard mostrará informações históricas e métricas cruciais de inventário e vendas no detalhe de um produto específico.

## 📌 Endpoint Requerido
`GET /api/products/:sku/analytics`

### 1. Parâmetros Aceitos (Query Params)
- **`period`** (string): Pode receber os valores `7d`, `15d`, `30d` (padrão) e `1y`. 
  - *Define a janela de contagem (para visitas, vendas e formação do gráfico temporal).*

### 2. Retorno Esperado (Payload JSON)
A resposta deve seguir o padrão atual da API usando `message` e `data` contendo o objeto compilado abaixo:

```json
{
  "message": "Analytics recuperado com sucesso.",
  "data": {
    "totalVisits": 1250,              // Visitas rastreadas no período escolhido
    "totalSales": 145,                // Unidades vendidas no período escolhido
    "conversionRate": 11.6,           // Taxa % (vendas / visitas * 100)
    "currentStock": 450,              // Estoque Físico atual consolidado 
    "stockCoverageDays": 93,          // Estoque Atual / (Vendas no período / dias do período) -> Ex: (450 / (145/30)) = 93 dias
    
    // Arrays para formatar no Gráfico (ApexCharts)
    // Opcional: Se houver dados de Visitas colocar neste mesmo eixo. Se não tiver de sistema nativo no banco, trazer só a venda diária.
    "chartData": [
      {
        "_id": "2026-03-01",          // Data YYYY-MM-DD
        "totalVisits": 40,            // Opcional
        "totalQuantity": 4,           // Obrigatório: Sum de qtd de vendas do dia
        "totalRevenue": 350.50        // Obrigatório: Receita deste dia
      },
      {
        "_id": "2026-03-02",
        "totalVisits": 55,
        "totalQuantity": 8,
        "totalRevenue": 640.80
      }
      // ... assim por diante cobrindo o período da variável (7d, 15d, 30d)
    ]
  }
}
```

### 3. Regras de Negócio e Cálculos Sugeridos para o Backend

- **Pedidos Válidos:** Considerar na contagem `.totalSales` apenas pedidos consolidados (pago/enviado) dependendo da sua regra já implementada.
- **Stock Coverage:** Esse é um dado gerencial essencial. É o chamado RunRate. A fórmula ideal:
   `Média_Diária_Vendas = totalSales / periodo_em_dias`
   `StockCoverageDays = Math.floor( currentStock / Média_Diária_Vendas )`
- Caso as Visitas do Mercado Livre ainda não estejam salvas nativamente no próprio Banco (via webhooks em Ads/visits db), você pode **apenas setar as visitas como nulas ou zero**, e o Front adaptará de acordo sem quebrar a tela. A princípio foque na métrica financeira (totalSales e Receita Agrupada).
