# 🛠️ Ajuste Necessário: Formatação de Datas no Analytics de Produtos

**Contexto:** O componente visual de gráfico (`IncomeAreaChart`) implementado no frontend aguarda o campo num formato de data legível para construir o eixo X, pois isolado no lado do cliente fica vago exibir apenas o número do dia quando lidamos com análises de até 30 dias que englobam meses diferentes.

**Problema:** Atualmente, a rota (`GET /api/products/:sku/analytics?period=...`) está enviando dentro do array `chartData` a propriedade de data (ex: `periodLabel` ou `_id`) contendo **apenas o número do dia isolado** (Ex: `"14"`).

**O que precisamos alterar no arquivo `productsController.js`:**

Por favor, modifique a forma como a agregação/formatação de dias está ocorrendo. No loop/map que monta os itens do `chartData`, modifique a string retornada para incluir o mês:

**Formato Atual (Incompleto):**
```json
{ 
  "periodLabel": "14", 
  "sales": 20, 
  "revenue": 2029 
}
```

**Novo Formato Esperado (Aprovado):**
```json
{ 
  "periodLabel": "14/03", 
  "sales": 20, 
  "revenue": 2029 
}
```

**Como implementar na prática em Node.js (Exemplo dependendo de como agrupou):**
```javascript
// Se você tiver uma string/data completa do Sequelize como "2026-03-14":
const dateObj = new Date(valorBanco);
const formatted = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // Retorna "14/03"

// ... E passe "formatted" no objeto do array.
```

O Frontend já está configurado para ler o que a API repassar! Assim que devolver a string formatada em "Dia/Mês", o gráfico atualizará o Eixo X e o texto ao passar o mouse perfeitamente de forma automática.
