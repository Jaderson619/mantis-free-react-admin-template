# 📊 Especificação Detalhada - Endpoint Sales Summary

**Endpoint:** `GET /api/orders/sales-summary`  
**Versão:** 1.0  
**Data:** 22/10/2025  
**Componente Frontend:** `ApprovedSalesChart.jsx`

---

## 🎯 Objetivo

Fornecer dados agregados de vendas aprovadas para exibição em gráficos com diferentes períodos e agrupamentos.

---

## 📡 Request

### URL
```
GET http://localhost:5001/api/orders/sales-summary
```

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `startDate` | string | ✅ Sim | Data de início (ISO 8601) | `2025-01-01T00:00:00` |
| `endDate` | string | ✅ Sim | Data de fim (ISO 8601) | `2025-10-22T23:59:59` |
| `period` | string | ✅ Sim | Tipo de período | `year` |
| `groupBy` | string | ✅ Sim | Tipo de agrupamento | `month` |
| `includeFrete` | boolean | ❌ Não | Incluir frete no cálculo | `false` |

---

## 📋 Valores Válidos

### `period` (Tipo de Período)

| Valor | Descrição | Intervalo Típico | groupBy Padrão |
|-------|-----------|------------------|----------------|
| `today` | Vendas de hoje | 00:00:00 até 23:59:59 do dia atual | `hour` |
| `week` | Vendas desta semana | Domingo a Sábado | `day` |
| `month` | Vendas deste mês | 1º dia até último dia do mês | `day` |
| `month-weekly` | Vendas deste mês (por semana) | 1º dia até último dia do mês | `week` |
| `year` | Vendas deste ano | 01/01 até 31/12 | `month` |
| `all-time` | Todas as vendas | Desde 2020-01-01 até hoje | `year` |

### `groupBy` (Tipo de Agrupamento)

| Valor | Descrição | Usado em | Formato do Period |
|-------|-----------|----------|-------------------|
| `hour` | Agrupa por hora | `period=today` | `"14:00"`, `"15:00"`, `"16:00"` |
| `day` | Agrupa por dia | `period=week`, `period=month` | `"2025-10-01"`, `"2025-10-02"` |
| `week` | Agrupa por semana | `period=month-weekly` | `"2025-W40"`, `"2025-W41"` |
| `month` | Agrupa por mês | `period=year` | `"2025-01"`, `"2025-02"` |
| `year` | Agrupa por ano | `period=all-time` | `"2023"`, `"2024"`, `"2025"` |

---

## 📊 Mapeamento Frontend → Backend

### Cálculo de Datas (Frontend)

```javascript
// Frontend calcula as datas baseado no período selecionado
switch(period) {
  case 'today':
    startDate = dayjs().startOf('day');     // 2025-10-22T00:00:00
    endDate = dayjs().endOf('day');          // 2025-10-22T23:59:59
    break;
    
  case 'week':
    startDate = dayjs().startOf('week');     // Domingo 00:00:00
    endDate = dayjs().endOf('week');         // Sábado 23:59:59
    break;
    
  case 'month':
    startDate = dayjs().startOf('month');    // 2025-10-01T00:00:00
    endDate = dayjs().endOf('month');        // 2025-10-31T23:59:59
    break;
    
  case 'month-weekly':
    startDate = dayjs().startOf('month');    // 2025-10-01T00:00:00
    endDate = dayjs().endOf('month');        // 2025-10-31T23:59:59
    break;
    
  case 'year':
    startDate = dayjs().startOf('year');     // 2025-01-01T00:00:00
    endDate = dayjs().endOf('year');         // 2025-12-31T23:59:59
    break;
    
  case 'all-time':
    startDate = dayjs('2020-01-01');         // 2020-01-01T00:00:00
    endDate = dayjs();                       // Hoje 23:59:59
    break;
}
```

### Combinações Típicas

| Period | groupBy | StartDate | EndDate | Resultado Esperado |
|--------|---------|-----------|---------|-------------------|
| `today` | `hour` | 2025-10-22T00:00:00 | 2025-10-22T23:59:59 | 24 pontos (0h-23h) |
| `week` | `day` | 2025-10-20T00:00:00 | 2025-10-26T23:59:59 | 7 pontos (Dom-Sáb) |
| `month` | `day` | 2025-10-01T00:00:00 | 2025-10-31T23:59:59 | 31 pontos (dias) |
| `month-weekly` | `week` | 2025-10-01T00:00:00 | 2025-10-31T23:59:59 | 4-5 pontos (semanas) |
| `year` | `month` | 2025-01-01T00:00:00 | 2025-12-31T23:59:59 | 12 pontos (meses) |
| `all-time` | `year` | 2020-01-01T00:00:00 | 2025-10-22T23:59:59 | 6 pontos (anos) |

---

## 📦 Response

### Status 200 (Success)

```json
{
  "success": true,
  "totalSales": 5728,
  "totalRevenue": 736532.58,
  "salesByPeriod": [
    {
      "period": "2025-01",
      "periodLabel": "Janeiro 2025",
      "sales": 450,
      "revenue": 57800.50,
      "averageTicket": 128.45
    },
    {
      "period": "2025-02",
      "periodLabel": "Fevereiro 2025",
      "sales": 520,
      "revenue": 68900.20,
      "averageTicket": 132.50
    },
    {
      "period": "2025-03",
      "periodLabel": "Março 2025",
      "sales": 480,
      "revenue": 61440.00,
      "averageTicket": 128.00
    }
    // ... outros períodos
  ]
}
```

### Campos da Resposta

#### Nível Raiz

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `success` | boolean | Indica se a requisição foi bem-sucedida | `true` |
| `totalSales` | number | Total de vendas no período completo | `5728` |
| `totalRevenue` | number | Receita total no período completo | `736532.58` |
| `salesByPeriod` | array | Array com dados agrupados por período | `[...]` |

#### Objeto `salesByPeriod[]`

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `period` | string | Identificador do período | `"2025-01"` |
| `periodLabel` | string | Label formatada para exibição | `"Janeiro 2025"` |
| `sales` | number | Quantidade de vendas neste período | `450` |
| `revenue` | number | Receita total neste período | `57800.50` |
| `averageTicket` | number | Ticket médio (revenue / sales) | `128.45` |

---

## 🎨 Formatação de `periodLabel` por `groupBy`

### `groupBy: 'hour'`
```javascript
// Para period: "14:00"
periodLabel: "14:00"  // ou "14h" ou "2:00 PM"
```

### `groupBy: 'day'`
```javascript
// Para period: "2025-10-15"
periodLabel: "15/10"  // ou "Terça, 15/10" ou "15 Out"
```

### `groupBy: 'week'`
```javascript
// Para period: "2025-W40"
periodLabel: "Semana 40"  // ou "01/10 - 07/10"
```

### `groupBy: 'month'`
```javascript
// Para period: "2025-01"
periodLabel: "Janeiro 2025"  // ou "Jan/25" ou "Janeiro"
```

### `groupBy: 'year'`
```javascript
// Para period: "2025"
periodLabel: "2025"
```

---

## 🧮 Lógica de Cálculo (Backend)

### SQL Query Exemplo (PostgreSQL)

#### Para `groupBy: 'month'` (year)

```sql
SELECT 
  TO_CHAR(order_date, 'YYYY-MM') as period,
  TO_CHAR(order_date, 'Month YYYY') as period_label,
  COUNT(*) as sales,
  SUM(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as revenue,
  AVG(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as average_ticket
FROM orders
WHERE 
  order_date >= :startDate 
  AND order_date <= :endDate
  AND status = 'paid'
GROUP BY TO_CHAR(order_date, 'YYYY-MM'), TO_CHAR(order_date, 'Month YYYY')
ORDER BY period ASC;
```

#### Para `groupBy: 'day'` (week/month)

```sql
SELECT 
  TO_CHAR(order_date, 'YYYY-MM-DD') as period,
  TO_CHAR(order_date, 'DD/MM') as period_label,
  COUNT(*) as sales,
  SUM(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as revenue,
  AVG(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as average_ticket
FROM orders
WHERE 
  order_date >= :startDate 
  AND order_date <= :endDate
  AND status = 'paid'
GROUP BY TO_CHAR(order_date, 'YYYY-MM-DD'), TO_CHAR(order_date, 'DD/MM')
ORDER BY period ASC;
```

#### Para `groupBy: 'hour'` (today)

```sql
SELECT 
  TO_CHAR(order_date, 'HH24:00') as period,
  TO_CHAR(order_date, 'HH24:00') as period_label,
  COUNT(*) as sales,
  SUM(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as revenue,
  AVG(CASE 
    WHEN :includeFrete = true THEN total_paid_by_customer 
    ELSE total_paid_by_customer - shipping_cost 
  END) as average_ticket
FROM orders
WHERE 
  order_date >= :startDate 
  AND order_date <= :endDate
  AND status = 'paid'
GROUP BY TO_CHAR(order_date, 'HH24:00')
ORDER BY period ASC;
```

### Regras de Negócio

1. **Filtro de Status:**
   - Considerar apenas pedidos com `status = 'paid'` (vendas aprovadas)
   - Ignorar pedidos `cancelled`, `pending`, `refunded`

2. **Cálculo de Receita:**
   - Se `includeFrete = true`: usar `totalPaidByCustomer` (valor total com frete)
   - Se `includeFrete = false`: usar `totalPaidByCustomer - shippingCost` (sem frete)

3. **Ticket Médio:**
   - `averageTicket = revenue / sales`
   - Arredondar para 2 casas decimais

4. **Períodos Vazios:**
   - Se não houver vendas em um período, pode retornar com `sales: 0` e `revenue: 0`
   - OU omitir o período (frontend trata)

---

## 📊 Exemplos de Requisições

### Exemplo 1: Vendas do Ano (Por Mês)

**Request:**
```
GET /api/orders/sales-summary?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59&period=year&groupBy=month&includeFrete=false
```

**Response:**
```json
{
  "success": true,
  "totalSales": 5728,
  "totalRevenue": 736532.58,
  "salesByPeriod": [
    {"period": "2025-01", "periodLabel": "Janeiro 2025", "sales": 450, "revenue": 57800.50, "averageTicket": 128.45},
    {"period": "2025-02", "periodLabel": "Fevereiro 2025", "sales": 520, "revenue": 68900.20, "averageTicket": 132.50},
    {"period": "2025-03", "periodLabel": "Março 2025", "sales": 480, "revenue": 61440.00, "averageTicket": 128.00},
    {"period": "2025-04", "periodLabel": "Abril 2025", "sales": 510, "revenue": 65280.00, "averageTicket": 128.00},
    {"period": "2025-05", "periodLabel": "Maio 2025", "sales": 490, "revenue": 62720.00, "averageTicket": 128.00},
    {"period": "2025-06", "periodLabel": "Junho 2025", "sales": 475, "revenue": 60800.00, "averageTicket": 128.00},
    {"period": "2025-07", "periodLabel": "Julho 2025", "sales": 460, "revenue": 58880.00, "averageTicket": 128.00},
    {"period": "2025-08", "periodLabel": "Agosto 2025", "sales": 485, "revenue": 62080.00, "averageTicket": 128.00},
    {"period": "2025-09", "periodLabel": "Setembro 2025", "sales": 500, "revenue": 64000.00, "averageTicket": 128.00},
    {"period": "2025-10", "periodLabel": "Outubro 2025", "sales": 358, "revenue": 45824.00, "averageTicket": 128.00}
  ]
}
```

### Exemplo 2: Vendas do Mês (Por Dia)

**Request:**
```
GET /api/orders/sales-summary?startDate=2025-10-01T00:00:00&endDate=2025-10-31T23:59:59&period=month&groupBy=day&includeFrete=false
```

**Response:**
```json
{
  "success": true,
  "totalSales": 358,
  "totalRevenue": 45824.00,
  "salesByPeriod": [
    {"period": "2025-10-01", "periodLabel": "01/10", "sales": 12, "revenue": 1536.00, "averageTicket": 128.00},
    {"period": "2025-10-02", "periodLabel": "02/10", "sales": 15, "revenue": 1920.00, "averageTicket": 128.00},
    {"period": "2025-10-03", "periodLabel": "03/10", "sales": 10, "revenue": 1280.00, "averageTicket": 128.00},
    // ... outros dias até 31/10
  ]
}
```

### Exemplo 3: Vendas de Hoje (Por Hora)

**Request:**
```
GET /api/orders/sales-summary?startDate=2025-10-22T00:00:00&endDate=2025-10-22T23:59:59&period=today&groupBy=hour&includeFrete=false
```

**Response:**
```json
{
  "success": true,
  "totalSales": 18,
  "totalRevenue": 2304.00,
  "salesByPeriod": [
    {"period": "00:00", "periodLabel": "00:00", "sales": 0, "revenue": 0.00, "averageTicket": 0.00},
    {"period": "01:00", "periodLabel": "01:00", "sales": 0, "revenue": 0.00, "averageTicket": 0.00},
    {"period": "08:00", "periodLabel": "08:00", "sales": 2, "revenue": 256.00, "averageTicket": 128.00},
    {"period": "09:00", "periodLabel": "09:00", "sales": 5, "revenue": 640.00, "averageTicket": 128.00},
    {"period": "10:00", "periodLabel": "10:00", "sales": 3, "revenue": 384.00, "averageTicket": 128.00},
    {"period": "11:00", "periodLabel": "11:00", "sales": 4, "revenue": 512.00, "averageTicket": 128.00},
    {"period": "14:00", "periodLabel": "14:00", "sales": 2, "revenue": 256.00, "averageTicket": 128.00},
    {"period": "15:00", "periodLabel": "15:00", "sales": 2, "revenue": 256.00, "averageTicket": 128.00}
    // ... outras horas
  ]
}
```

### Exemplo 4: Vendas da Semana (Por Dia)

**Request:**
```
GET /api/orders/sales-summary?startDate=2025-10-20T00:00:00&endDate=2025-10-26T23:59:59&period=week&groupBy=day&includeFrete=false
```

**Response:**
```json
{
  "success": true,
  "totalSales": 85,
  "totalRevenue": 10880.00,
  "salesByPeriod": [
    {"period": "2025-10-20", "periodLabel": "Domingo, 20/10", "sales": 8, "revenue": 1024.00, "averageTicket": 128.00},
    {"period": "2025-10-21", "periodLabel": "Segunda, 21/10", "sales": 15, "revenue": 1920.00, "averageTicket": 128.00},
    {"period": "2025-10-22", "periodLabel": "Terça, 22/10", "sales": 12, "revenue": 1536.00, "averageTicket": 128.00},
    {"period": "2025-10-23", "periodLabel": "Quarta, 23/10", "sales": 14, "revenue": 1792.00, "averageTicket": 128.00},
    {"period": "2025-10-24", "periodLabel": "Quinta, 24/10", "sales": 13, "revenue": 1664.00, "averageTicket": 128.00},
    {"period": "2025-10-25", "periodLabel": "Sexta, 25/10", "sales": 16, "revenue": 2048.00, "averageTicket": 128.00},
    {"period": "2025-10-26", "periodLabel": "Sábado, 26/10", "sales": 7, "revenue": 896.00, "averageTicket": 128.00}
  ]
}
```

---

## ⚠️ Tratamento de Erros

### Erro 400 - Parâmetros Inválidos

```json
{
  "success": false,
  "error": "Invalid parameters",
  "message": "startDate and endDate are required",
  "details": {
    "missingFields": ["startDate", "endDate"]
  }
}
```

### Erro 400 - Período Inválido

```json
{
  "success": false,
  "error": "Invalid period",
  "message": "period must be one of: today, week, month, month-weekly, year, all-time",
  "details": {
    "received": "invalid-period",
    "allowed": ["today", "week", "month", "month-weekly", "year", "all-time"]
  }
}
```

### Erro 400 - Data Inválida

```json
{
  "success": false,
  "error": "Invalid date format",
  "message": "startDate must be in ISO 8601 format",
  "details": {
    "received": "2025-10-22",
    "expected": "2025-10-22T00:00:00"
  }
}
```

### Erro 500 - Erro Interno

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database query failed"
}
```

---

## 🧪 Testes de Validação

### Teste 1: Verificar Estrutura da Resposta

```javascript
const response = await fetch('http://localhost:5001/api/orders/sales-summary?...');
const data = await response.json();

// Validações
expect(data).toHaveProperty('success', true);
expect(data).toHaveProperty('totalSales');
expect(data).toHaveProperty('totalRevenue');
expect(data).toHaveProperty('salesByPeriod');
expect(Array.isArray(data.salesByPeriod)).toBe(true);
```

### Teste 2: Verificar Estrutura de salesByPeriod

```javascript
const firstPeriod = data.salesByPeriod[0];

expect(firstPeriod).toHaveProperty('period');
expect(firstPeriod).toHaveProperty('periodLabel');
expect(firstPeriod).toHaveProperty('sales');
expect(firstPeriod).toHaveProperty('revenue');
expect(firstPeriod).toHaveProperty('averageTicket');
```

### Teste 3: Verificar Cálculo de Ticket Médio

```javascript
const period = data.salesByPeriod[0];
const calculatedTicket = period.revenue / period.sales;

expect(period.averageTicket).toBeCloseTo(calculatedTicket, 2);
```

### Teste 4: Verificar Total

```javascript
const sumSales = data.salesByPeriod.reduce((sum, p) => sum + p.sales, 0);
const sumRevenue = data.salesByPeriod.reduce((sum, p) => sum + p.revenue, 0);

expect(data.totalSales).toBe(sumSales);
expect(data.totalRevenue).toBeCloseTo(sumRevenue, 2);
```

---

## 📈 Performance

### Recomendações

1. **Indexação:**
   ```sql
   CREATE INDEX idx_orders_date_status ON orders(order_date, status);
   CREATE INDEX idx_orders_date ON orders(order_date);
   ```

2. **Cache:**
   - Cachear resultados por 5 minutos para `period=year`
   - Cachear resultados por 1 minuto para `period=today`

3. **Limit:**
   - Máximo de 365 pontos (para `groupBy=day` em `all-time`)

---

## 🔗 Relacionamento com Frontend

### Arquivo: `ApprovedSalesChart.jsx`

**Linha ~104:** Requisição
```javascript
const response = await axios.get('http://localhost:5001/api/orders/sales-summary', { params });
```

**Linha ~115:** Processamento
```javascript
setSalesData({
  totalSales: response.data.totalSales || 0,
  totalRevenue: response.data.totalRevenue || 0,
  salesByPeriod: response.data.salesByPeriod || []
});
```

**Linha ~245:** Exibição
```javascript
<Typography variant="h3">
  {salesData.totalSales.toLocaleString()}
</Typography>
<Typography variant="h3">
  {formatCurrency(salesData.totalRevenue)}
</Typography>
```

---

## ✅ Checklist de Implementação

- [ ] Endpoint responde em `/api/orders/sales-summary`
- [ ] Aceita todos os query parameters
- [ ] Valida `startDate` e `endDate` (ISO 8601)
- [ ] Valida `period` (6 valores possíveis)
- [ ] Valida `groupBy` (5 valores possíveis)
- [ ] Filtra apenas pedidos `status = 'paid'`
- [ ] Calcula `totalSales` (soma de vendas)
- [ ] Calcula `totalRevenue` (considerando `includeFrete`)
- [ ] Agrupa por período correto
- [ ] Formata `periodLabel` adequadamente
- [ ] Calcula `averageTicket` por período
- [ ] Retorna array ordenado por `period` ASC
- [ ] Trata períodos vazios
- [ ] Retorna erros 400 para parâmetros inválidos
- [ ] Trata erros 500 graciosamente
- [ ] Testa com cURL
- [ ] Testa no Postman
- [ ] Testa integração com frontend

---

**Fim da Especificação**

Para dúvidas: jaderson@appgestor.com
