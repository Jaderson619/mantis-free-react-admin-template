## Ajuste do Endpoint de Analytics de Produtos

**Contexto:** O Frontend já está implementado e renderiza 9 cards de indicadores (aos moldes do Mercado Livre), além de um gráfico interativo multivariável. No entanto, algumas chaves não estão vindo no formato/nomenclatura esperada, deixando valores cruciais na tela como `0` ou sem exibição no gráfico.

**Ação:** Ajustar a rota `GET /api/products/:sku/analytics` para que o objeto `metrics` e o array histórico `chartData` retornem todas as propriedades mapeadas de forma definitiva.

### 1. Nomenclatura e Tipagem do Payload do Objeto `metrics` (Os Cards)
Para popular os cards no topo da tela, a resposta completa DEVE utilizar exatamente as chaves do objeto abaixo (dentro de `data.metrics`), garantindo números em vez de undefined:
```json
{
  "message": "Analytics recuperado com sucesso.",
  "data": {
    "metrics": {
      "vendasBrutas": 2008.18,      // Soma do valor financeiro bruto gerado pelos pedidos no período (mesmo cancelados/recusados)
      "vendasConcluidas": 1936.70,  // Soma do valor financeiro dos pedidos efetivados/aprovados/faturados
      "unidadesVendidas": 57,       // Quantidade total de itens físicos despachados no período
      "precoMedio": 35.23,          // = vendasConcluidas / unidadesVendidas
      "visitasUnicas": 419,         // Visitantes únicos rastreados no produto (caso a API do MercadoLivre não diferencie, force um agrupamento geográfico ou de login, se tiver, do contrário retorne o mesmo da Visits, ou aplique uma % baseada no mercado, como 70% das visitas totais)
      "totalVisitas": 622,          // Visitas gerais rastreadas neste produto pela sub-API de Visits do ML
      "compradoresUnicos": 45,      // Quantidade de CNPJs/CPFs ou client_id distintos que efetivaram as 'unidadesVendidas'
      "conversao": 11.2,            // (unidadesVendidas / totalVisitas) * 100
      "qtdVendasBrutas": 46,        // Número total de instâncias (linhas) de pedidos feitos, antes de qualquer corte ou item sumário
      "currentStock": 150,          // Estoque físico atual da tabela de produtos original
      "stockCoverageDays": 80       // = currentStock / (unidadesVendidas / Periodo_Em_Dias)
    },
    // Array responsável por traçar linha a linha na tela de histórico dinâmico.
    // Todos eles DEVEM existir para cada bloco temporal. Se for 0, mande 0 em vez de não enviar a chave.
    "chartData": [
      {
        "date": "2024-03-01", 
        "grossRevenue": 350.50,      // Preenche linha Vendas Brutas (R$)
        "revenue": 300.00,           // Preenche linha Vendas Concluídas (R$)
        "sales": 10,                 // Preenche linha Unidades Vendidas
        "avgPrice": 30.00,           // Preenche linha Preço Médio (R$)
        "uniqueViews": 85,           // Preenche linha Visitas Únicas
        "views": 120,                // Preenche linha Total Visitas
        "uniqueBuyers": 8,           // Preenche linha Compradores Únicos
        "conversion": 8.33,          // Preenche linha de Conversão (%)
        "grossSalesCount": 9         // Preenche linha Qtd Vendas Brutas
      },
      // ... continuar o array respeitando datas
    ]
  }
}
```

### 2. Notas Extras para o Desenvolvedor do Node.js
- **Crucial:** Repare que as chaves em `chartData` não são iguais as de `metrics`. O front mapeia como inglês na extração histórica iterativa para padronização interna com outras APIS. Por favor, forneça o `chartData` utilizando keys como `grossRevenue`, `views` e `uniqueViews`, e o objeto `metrics` usando `vendasBrutas`, `totalVisitas` etc, como listado no exemplo em JSON, isso criará perfeitamente o seu gráfico na frente.
- **Sobre Visitas Únicas**: Se no seu backend você está esbarrando com limites da API de /items/visits do Mercado Livre (que às vezes unifica tudo num bolo global e não divide os únicos), você pode precisar fazer uma consulta paralela para IDs de sessões, ou calcular "Compradores Únicos" baseando-se no `buyer.id` do array de pedidos da API de Orders do Mercado Livre. 
