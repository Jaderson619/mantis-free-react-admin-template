# 📡 Especificação de API - AppGestor Vendas

**Versão:** 2.0  
**Data:** 22/10/2025  
**Autor:** Jaderson Jonas Silva  
**Base URL:** `http://localhost:5001/api`

---

## 📋 Índice

1. [Pedidos (Orders)](#1-pedidos-orders)
2. [Produtos (Products)](#2-produtos-products)
3. [Relatórios (Reports)](#3-relatórios-reports)
4. [Dashboard](#4-dashboard)
5. [NFe (Notas Fiscais)](#5-nfe-notas-fiscais)

---

## 1. Pedidos (Orders)

### 1.1. Listar Pedidos do Banco de Dados

**Endpoint:** `GET /api/orders/db`

**Descrição:** Retorna pedidos armazenados no banco de dados com informações financeiras completas.

**Query Parameters:**
```typescript
{
  page?: number;           // Página atual (padrão: 1)
  limit?: number;          // Items por página (padrão: 40)
  status?: string;         // Filtro por status
  startDate?: string;      // Data início (ISO 8601)
  endDate?: string;        // Data fim (ISO 8601)
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 123,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "ML-12345678",
        "orderDate": "2025-10-15T14:30:00.000Z",
        "status": "paid",
        "shippingStatus": "ready_to_ship",
        
        // Informações do Comprador
        "buyer": {
          "name": "João Silva",
          "email": "joao@email.com",
          "phone": "+5511999999999"
        },
        "buyerNickname": "JOAOSILVA123",
        
        // Endereço de Entrega
        "shippingAddress": "Rua Exemplo, 123 - São Paulo, SP",
        "customerZip": "01234-567",
        "estimatedDelivery": "2025-10-20T23:59:59.000Z",
        
        // ===== VALORES FINANCEIROS (NÍVEL PEDIDO) =====
        "totalPaidByCustomer": 259.90,      // Total pago pelo cliente
        "shippingCost": 15.00,              // Frete pago pelo cliente
        "sellerShippingCost": 0.00,         // Frete pago pelo vendedor (se > 0, é custo)
        "marketplaceFee": 33.79,            // Taxa do Mercado Livre (calculada)
        "grossRevenue": 211.11,             // Receita bruta (total - frete - taxa ML)
        "taxAmount": 20.79,                 // Impostos (8% sobre receita)
        "totalProductCost": 100.80,         // Custo total dos produtos (FIFO)
        "netProfit": 89.52,                 // Lucro líquido final
        
        // Contadores
        "itemCount": 3,                     // Quantidade de items no pedido
        
        // Items do Pedido
        "items": [
          {
            "id": 456,
            "quantity": 2,
            "unitPrice": 50.00,
            "totalPrice": 100.00,
            
            // Custos do Item
            "productCost": 25.00,           // Custo unitário do produto
            "lotCost": 24.50,               // Custo FIFO do lote usado
            "itemTotalCost": 49.00,         // Custo total deste item (quantity * lotCost)
            "marketplaceFees": 13.00,       // Taxa ML proporcional deste item
            
            // Produto
            "product": {
              "id": 789,
              "sku": "PROD-001",
              "name": "Produto Exemplo",
              "description": "Descrição do produto",
              "currentStock": 50
            },
            
            // Listagem (se marketplace)
            "listing": {
              "id": "MLB123456789",
              "title": "Título no Mercado Livre",
              "thumbnail": "https://http2.mlstatic.com/D_123456-MLA.jpg",
              "permalink": "https://produto.mercadolivre.com.br/MLB-123456789"
            }
          }
        ],
        
        // Metadados
        "thumbnail": "https://http2.mlstatic.com/D_123456-MLA.jpg",
        "createdAt": "2025-10-15T14:30:00.000Z",
        "updatedAt": "2025-10-15T15:45:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 40,
      "total": 5728,
      "totalPages": 144
    }
  }
}
```

**Response 400 (Bad Request):**
```json
{
  "success": false,
  "error": "Invalid parameters",
  "details": {
    "field": "limit",
    "message": "Must be between 1 and 100"
  }
}
```

**Response 500 (Server Error):**
```json
{
  "success": false,
  "error": "Database connection failed",
  "message": "Could not connect to database"
}
```

---

### 1.2. Sincronizar Pedidos do Mercado Livre

**Endpoint:** `POST /api/orders/sync`

**Descrição:** Busca pedidos do Mercado Livre e sincroniza com o banco de dados.

**Request Body:**
```json
{
  "startDate": "2025-10-01T00:00:00.000Z",
  "endDate": "2025-10-22T23:59:59.000Z",
  "forceUpdate": false  // true para forçar atualização de pedidos existentes
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "ordersProcessed": 150,
    "ordersCreated": 45,
    "ordersUpdated": 105,
    "errors": 0,
    "processingTime": "12.5s"
  }
}
```

---

### 1.3. Resumo de Vendas (Para Gráfico)

**Endpoint:** `GET /api/orders/sales-summary`

**Descrição:** Retorna dados agregados de vendas para exibição em gráficos.

**Query Parameters:**
```typescript
{
  startDate: string;       // Data início (ISO 8601) - OBRIGATÓRIO
  endDate: string;         // Data fim (ISO 8601) - OBRIGATÓRIO
  period: 'today' | 'week' | 'month' | 'month-weekly' | 'year' | 'all-time';
  groupBy: 'hour' | 'day' | 'week' | 'month' | 'year';
  includeFrete: boolean;   // Incluir frete no cálculo de receita
}
```

**Exemplo de URL:**
```
GET /api/orders/sales-summary?startDate=2025-01-01T00:00:00&endDate=2025-10-22T23:59:59&period=year&groupBy=month&includeFrete=false
```

**Response 200 (Success):**
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
    }
    // ... outros períodos
  ]
}
```

**Mapeamento de Agrupamento:**
```typescript
period: 'today'        → groupBy: 'hour'   → periodLabel: "14:00", "15:00", ...
period: 'week'         → groupBy: 'day'    → periodLabel: "Segunda", "Terça", ...
period: 'month'        → groupBy: 'day'    → periodLabel: "01/10", "02/10", ...
period: 'month-weekly' → groupBy: 'week'   → periodLabel: "Semana 1", "Semana 2", ...
period: 'year'         → groupBy: 'month'  → periodLabel: "Janeiro", "Fevereiro", ...
period: 'all-time'     → groupBy: 'year'   → periodLabel: "2023", "2024", "2025"
```

---

## 2. Produtos (Products)

### 2.1. Listar Produtos

**Endpoint:** `GET /api/products`

**Descrição:** Retorna lista de produtos com custos e estoque.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;         // Busca por SKU, nome, EAN
  category?: string;
  minStock?: number;
  maxStock?: number;
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 789,
        "sku": "PROD-001",
        "name": "Produto Exemplo",
        "description": "Descrição detalhada",
        "ean": "7891234567890",
        "ncm": "12345678",
        "category": "Eletrônicos",
        
        // Estoque
        "currentStock": 50,
        "minimumStock": 10,
        "maximumStock": 100,
        
        // Custos e Preços
        "averageCost": 25.00,           // Custo médio ponderado
        "lastCost": 24.50,              // Último custo de compra
        "sellingPrice": 50.00,          // Preço de venda
        
        // Lotes FIFO
        "lots": [
          {
            "id": 101,
            "quantity": 30,
            "unitCost": 24.00,
            "purchaseDate": "2025-09-15T10:00:00.000Z",
            "supplier": "Fornecedor A",
            "nfeNumber": "123456"
          },
          {
            "id": 102,
            "quantity": 20,
            "unitCost": 25.50,
            "purchaseDate": "2025-10-01T10:00:00.000Z",
            "supplier": "Fornecedor B",
            "nfeNumber": "789012"
          }
        ],
        
        // Impostos
        "taxRate": 0.08,                // 8%
        "taxType": "SIMPLES",
        
        // Metadados
        "createdAt": "2025-01-10T10:00:00.000Z",
        "updatedAt": "2025-10-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "totalPages": 25
    }
  }
}
```

---

### 2.2. Importar NFe

**Endpoint:** `POST /api/products/import-nfe`

**Descrição:** Importa produtos de arquivos XML de NFe.

**Request (multipart/form-data):**
```typescript
{
  files: File[];           // Array de arquivos XML
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "batchId": "batch-123456",
    "filesReceived": 3,
    "status": "processing"
  }
}
```

---

### 2.3. Status de Importação NFe

**Endpoint:** `GET /api/nfe/status/:batchId`

**Descrição:** Verifica status de processamento de um lote de NFe.

**Response 200 (Success):**
```json
{
  "success": true,
  "batchId": "batch-123456",
  "status": "completed",
  "progress": {
    "total": 3,
    "processed": 3,
    "success": 2,
    "failed": 1
  },
  "files": [
    {
      "filename": "nfe-001.xml",
      "status": "success",
      "productsImported": 5,
      "message": "Importação concluída"
    },
    {
      "filename": "nfe-002.xml",
      "status": "success",
      "productsImported": 3,
      "message": "Importação concluída"
    },
    {
      "filename": "nfe-003.xml",
      "status": "error",
      "productsImported": 0,
      "message": "XML inválido: formato não reconhecido"
    }
  ]
}
```

**Status possíveis:**
- `pending` - Aguardando processamento
- `processing` - Processando
- `completed` - Concluído (todos os arquivos processados)
- `partial` - Parcialmente concluído (alguns falharam)
- `error` - Erro geral no processamento

---

## 3. Relatórios (Reports)

### 3.1. Resumo de Vendas (Cards Dashboard)

**Endpoint:** `GET /api/reports/salesSummary`

**Descrição:** Retorna totalizadores financeiros para os cards do dashboard.

**Query Parameters:**
```typescript
{
  startDate: string;       // Data início (YYYY-MM-DD HH:mm:ss)
  endDate: string;         // Data fim (YYYY-MM-DD HH:mm:ss)
  status?: string;         // Filtro por status (ex: "paid")
}
```

**Exemplo de URL:**
```
GET /api/reports/salesSummary/?startDate=2024-09-22%2000:00:00&endDate=2025-10-22%2023:59:59&status=paid
```

**Response 200 (Success):**
```json
{
  "success": true,
  "resumoVendas": {
    "receitaTotalVendasAprovadas": "736532.58",
    "totalCustoImposto": "79850.45",
    "totalTarifasVenda": "95749.24",
    "totalFrete": "53.96",
    "totalMargemContribuicao": "560879.93",
    "quantidadeVendasAprovadas": 5728,
    "ticketMedio": "128.58",
    "ticketMedioMargem": "97.95"
  }
}
```

**Explicação dos Campos:**
```typescript
{
  receitaTotalVendasAprovadas: string;    // Soma de totalPaidByCustomer
  totalCustoImposto: string;              // Soma de (totalProductCost + taxAmount)
  totalTarifasVenda: string;              // Soma de marketplaceFee
  totalFrete: string;                     // Soma de sellerShippingCost (frete pago pelo vendedor)
  totalMargemContribuicao: string;        // Soma de netProfit
  quantidadeVendasAprovadas: number;      // Contagem de pedidos
  ticketMedio: string;                    // receitaTotal / quantidade
  ticketMedioMargem: string;              // margemTotal / quantidade
}
```

**Observações:**
- ✅ Valores retornados como STRING para evitar problemas de precisão decimal
- ✅ Usar `parseFloat()` no frontend para converter
- ✅ `totalFrete` deve considerar apenas `sellerShippingCost` (custo real do vendedor)

---

## 4. Dashboard

### 4.1. Métricas Gerais

**Endpoint:** `GET /api/dashboard/metrics`

**Descrição:** Retorna métricas gerais para o dashboard.

**Query Parameters:**
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "data": {
    "salesMetrics": {
      "totalOrders": 5728,
      "totalRevenue": 736532.58,
      "averageTicket": 128.58,
      "conversionRate": 3.5
    },
    "financialMetrics": {
      "grossProfit": 560879.93,
      "netProfit": 465130.48,
      "profitMargin": 63.15,
      "roi": 461.45
    },
    "topProducts": [
      {
        "sku": "PROD-001",
        "name": "Produto Top 1",
        "salesCount": 450,
        "revenue": 22500.00
      }
    ],
    "topCategories": [
      {
        "category": "Eletrônicos",
        "salesCount": 1200,
        "revenue": 156000.00
      }
    ]
  }
}
```

---

## 5. NFe (Notas Fiscais)

### 5.1. Upload de NFe

**Endpoint:** `POST /api/nfe/upload`

**Descrição:** Faz upload de arquivos XML de NFe para processamento.

**Request (multipart/form-data):**
```typescript
{
  files: File[];           // Array de arquivos XML (max 50)
}
```

**Response 200 (Success):**
```json
{
  "success": true,
  "batchId": "batch-abc123",
  "message": "Arquivos recebidos e em processamento",
  "filesCount": 3
}
```

**Response 400 (Bad Request):**
```json
{
  "success": false,
  "error": "Too many files",
  "message": "Maximum 50 files allowed per batch"
}
```

---

## 📊 Schemas TypeScript

### Order Schema
```typescript
interface Order {
  id: number;
  uuid: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  shippingStatus: ShippingStatus;
  
  // Comprador
  buyer: {
    name: string;
    email: string;
    phone?: string;
  };
  buyerNickname: string;
  
  // Entrega
  shippingAddress: string;
  customerZip: string;
  estimatedDelivery: string;
  
  // Financeiro (Nível Pedido)
  totalPaidByCustomer: number;
  shippingCost: number;
  sellerShippingCost: number;
  marketplaceFee: number;
  grossRevenue: number;
  taxAmount: number;
  totalProductCost: number;
  netProfit: number;
  
  // Items
  itemCount: number;
  items: OrderItem[];
  
  // Metadados
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Custos
  productCost: number;
  lotCost: number;
  itemTotalCost: number;
  marketplaceFees: number;
  
  // Produto
  product: {
    id: number;
    sku: string;
    name: string;
    description?: string;
    currentStock: number;
  };
  
  // Listagem
  listing?: {
    id: string;
    title: string;
    thumbnail: string;
    permalink: string;
  };
}

type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'waiting' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

type ShippingStatus = 
  | 'pending' 
  | 'ready_to_ship' 
  | 'shipped' 
  | 'delivered' 
  | 'authorized';
```

### Product Schema
```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  ean?: string;
  ncm?: string;
  category?: string;
  
  // Estoque
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  
  // Preços
  averageCost: number;
  lastCost: number;
  sellingPrice: number;
  
  // Lotes
  lots: ProductLot[];
  
  // Impostos
  taxRate: number;
  taxType: string;
  
  // Metadados
  createdAt: string;
  updatedAt: string;
}

interface ProductLot {
  id: number;
  quantity: number;
  unitCost: number;
  purchaseDate: string;
  supplier?: string;
  nfeNumber?: string;
}
```

---

## 🔒 Autenticação

**Header Obrigatório:**
```
Authorization: Bearer {token}
```

**Resposta 401 (Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

---

## ⚠️ Tratamento de Erros

### Padrão de Resposta de Erro
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Descrição legível do erro",
  "details": {
    "field": "nome_do_campo",
    "value": "valor_inválido",
    "reason": "Motivo específico"
  }
}
```

### Códigos HTTP
- `200` - Sucesso
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `422` - Validação falhou
- `500` - Erro interno do servidor

---

## 🧪 Exemplos de Requisições

### cURL - Listar Pedidos
```bash
curl -X GET "http://localhost:5001/api/orders/db?page=1&limit=20" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### cURL - Resumo de Vendas
```bash
curl -X GET "http://localhost:5001/api/reports/salesSummary/?startDate=2024-09-22%2000:00:00&endDate=2025-10-22%2023:59:59&status=paid" \
  -H "Content-Type: application/json"
```

### JavaScript - Fetch Orders
```javascript
const response = await fetch('http://localhost:5001/api/orders/db?page=1&limit=40', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log('Orders:', data.orders);
```

### JavaScript - Upload NFe
```javascript
const formData = new FormData();
files.forEach(file => formData.append('files', file));

const response = await fetch('http://localhost:5001/api/nfe/upload', {
  method: 'POST',
  body: formData
});

const { batchId } = await response.json();
console.log('Batch ID:', batchId);
```

---

## 📝 Notas Importantes

### Datas
- ✅ Sempre usar ISO 8601: `2025-10-22T14:30:00.000Z`
- ✅ Backend deve aceitar timezone UTC
- ✅ Frontend envia com `.startOf('day')` e `.endOf('day')`

### Números Decimais
- ✅ Backend deve retornar como STRING em alguns endpoints (salesSummary)
- ✅ Frontend converte com `parseFloat()` ou `Number()`
- ✅ Usar sempre 2 casas decimais para valores monetários

### Paginação
- ✅ Padrão: `page=1, limit=40`
- ✅ Máximo: `limit=100`
- ✅ Sempre retornar objeto `pagination` com totais

### CORS
- ✅ Backend deve aceitar requisições de `http://localhost:3000` e `http://localhost:3001`
- ✅ Permitir métodos: `GET, POST, PUT, DELETE, OPTIONS`
- ✅ Permitir headers: `Content-Type, Authorization`

---

## 🚀 Próximos Endpoints (Futuro)

- `GET /api/analytics/profit-by-product` - Lucro por produto
- `GET /api/analytics/sales-by-channel` - Vendas por canal
- `POST /api/orders/:id/refund` - Processar reembolso
- `GET /api/inventory/low-stock` - Produtos com estoque baixo
- `POST /api/products/bulk-update` - Atualização em lote

---

**Fim da Especificação**

Para dúvidas ou sugestões, contate: jaderson@appgestor.com
