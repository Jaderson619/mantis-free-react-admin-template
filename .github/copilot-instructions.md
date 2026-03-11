# 🤖 Custom Instructions - GitHub Copilot

## 👤 Sobre o Usuário

**Nome:** Jaderson Jonas Silva  
**Projeto:** AppGestor Vendas (Sistema de Gestão de Vendas - SaaS)  
**Stack Técnico:**
- **Frontend:** React 18 + Vite + Material-UI v5
- **Backend:** Node.js + Express + Sequelize + PostgreSQL
- **Idioma:** Português Brasileiro (PT-BR)
- **Sistema:** macOS
- **Workspace:** `/Users/jadersonjonassilva/Documents/GitHub/AppGestorVendas-Frontend`

**Contexto do Projeto:**
- Sistema de gestão de vendas com integração Mercado Livre
- Migrou de Mantis Template para MUI puro (licença MIT)
- Foco em uso comercial (SaaS)
- Cálculos financeiros complexos (custos FIFO, impostos, margens)

---

## 🎯 Comportamento Esperado

### 1. **SEMPRE VERIFICAR ANTES DE IMPLEMENTAR**
```bash
# Sequência obrigatória antes de qualquer código:
1. grep -r "nome_do_componente" src/
2. grep -r "nome_da_função" src/
3. Verificar imports existentes
4. Analisar padrões do projeto
```

**Regra de Ouro:** Nunca reimplementar algo que já existe no projeto!

### 2. **ANÁLISE DE CÓDIGO EXISTENTE**

Antes de sugerir qualquer implementação:
- ✅ Verificar se o componente/função já existe
- ✅ Verificar se há um padrão estabelecido no projeto
- ✅ Verificar dependências já instaladas no `package.json`
- ✅ Verificar estrutura de pastas existente

**Exemplo de resposta ideal:**
```
🔍 Analisando o código existente...
✅ Encontrei o componente MainCard em src/components/MainCard.jsx
✅ Vou reutilizá-lo ao invés de criar um novo
```

### 3. **ESTRUTURA DE RESPOSTA**

Sempre estruturar respostas nesta ordem:

```markdown
## 🔍 Análise
[O que foi encontrado no código existente]

## ✅ Solução
[O que será implementado]

## 📝 Código
[Blocos de código com filepath]

## 🧪 Teste
[Como testar a implementação]

## 📚 Documentação
[Se necessário, explicações adicionais]
```

### 4. **PADRÕES DE CÓDIGO**

#### React/JSX
```javascript
// ✅ BOM - Seguir padrões do projeto
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

export default function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MainCard title="Título">
      <Box sx={{ p: 2 }}>
        <Typography>Conteúdo</Typography>
      </Box>
    </MainCard>
  );
}
```

#### Imports
```javascript
// ✅ Ordem correta de imports
// 1. React
import { useState } from 'react';

// 2. Bibliotecas externas
import axios from 'axios';
import { Box } from '@mui/material';

// 3. Componentes locais
import MainCard from 'components/MainCard';

// 4. Assets/Utils
import { formatCurrency } from 'utils/formatters';
```

#### Estilização
```javascript
// ✅ Usar sx prop do MUI (não styled-components)
<Box 
  sx={{ 
    p: 2, 
    bgcolor: 'primary.lighter',
    borderRadius: 2
  }}
>
```

#### Ícones
```javascript
// ✅ Usar Ant Design Icons (@ant-design/icons)
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

// ❌ NÃO usar @mui/icons-material (não instalado)
```

### 5. **BOAS PRÁTICAS OBRIGATÓRIAS**

#### Tratamento de Erros
```javascript
// ✅ Sempre tratar erros
try {
  const response = await axios.get('/api/data');
  setData(response.data);
} catch (error) {
  console.error('❌ Erro ao buscar dados:', error);
  setSnack({ open: true, msg: error.message, type: 'error' });
}
```

#### Validação de Dados
```javascript
// ✅ Sempre validar antes de usar
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const price = num(item.price); // Seguro!
```

#### Formatação de Moeda
```javascript
// ✅ Padrão do projeto
R$ {value.toFixed(2)}

// ✅ Com formatação brasileira
new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value)
```

### 6. **TESTES**

Sempre incluir seção de testes:

```markdown
## 🧪 Como Testar

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Acesse: http://localhost:3001/rota

3. Verifique:
   - [ ] Componente renderiza
   - [ ] Dados carregam corretamente
   - [ ] Erros são tratados
   - [ ] UI responsiva
```

### 7. **DEBUGGING**

Sempre adicionar logs úteis:

```javascript
// ✅ Logs descritivos com emojis
console.log('🔍 Processando pedido:', order);
console.log('✅ Dados carregados:', data.length, 'itens');
console.log('❌ Erro ao salvar:', error);
console.log('⚠️ Aviso: Valor inválido detectado');
```

### 8. **DOCUMENTAÇÃO DE CÓDIGO**

```javascript
// ✅ Comentários úteis
/**
 * Calcula o lucro líquido do pedido
 * @param {number} revenue - Receita bruta
 * @param {number} costs - Custos totais
 * @returns {number} Lucro líquido
 */
const calculateProfit = (revenue, costs) => {
  return revenue - costs;
};

// ✅ Comentários inline para lógica complexa
// Usa FIFO: primeiro lote que entrou é o primeiro que sai
const costLot = lots.find(l => l.quantity > 0);
```

### 9. **COMMITS E MENSAGENS**

```bash
# ✅ Formato Conventional Commits
git commit -m "feat: Adicionar cálculo de frete por vendedor"
git commit -m "fix: Corrigir exibição de valores negativos"
git commit -m "refactor: Extrair lógica de cálculo para utils"
git commit -m "docs: Atualizar README com novos campos"
git commit -m "style: Ajustar espaçamento da tabela"
```

### 10. **RESPONSIVIDADE**

```javascript
// ✅ Sempre considerar mobile
<Grid container spacing={2}>
  <Grid item xs={12} md={6} lg={3}>
    <Card />
  </Grid>
</Grid>

// ✅ Stack com direção responsiva
<Stack 
  direction={{ xs: 'column', md: 'row' }} 
  spacing={2}
>
```

---

## 🚫 O QUE NÃO FAZER

### ❌ Reimplementações Desnecessárias
```javascript
// ❌ NÃO criar MainCard personalizado
// ✅ Usar o existente em src/components/MainCard.jsx

// ❌ NÃO criar nova função de formatação
// ✅ Usar a existente em src/utils/
```

### ❌ Dependências Desnecessárias
```bash
# ❌ NÃO instalar sem verificar
npm install moment

# ✅ Verificar se já existe alternativa
# O projeto já usa date-fns ou JS nativo
```

### ❌ Código Duplicado
```javascript
// ❌ NÃO copiar e colar
const formatPrice1 = (v) => `R$ ${v.toFixed(2)}`;
const formatPrice2 = (v) => `R$ ${v.toFixed(2)}`;

// ✅ Criar uma função reutilizável
// src/utils/formatters.js
export const formatCurrency = (v) => `R$ ${v.toFixed(2)}`;
```

### ❌ Hardcoded Values
```javascript
// ❌ Valores fixos no código
const API_URL = 'http://localhost:5001';

// ✅ Variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

---

## 📋 CHECKLIST PRÉ-IMPLEMENTAÇÃO

Antes de sugerir qualquer código, verificar:

- [ ] 🔍 Componente/função já existe?
- [ ] 📦 Dependência já está instalada?
- [ ] 🎨 Segue o padrão de estilo do projeto?
- [ ] 🌐 Usa i18n (PT-BR)?
- [ ] 📱 É responsivo?
- [ ] ♿ É acessível?
- [ ] 🧪 Pode ser testado facilmente?
- [ ] 🐛 Trata erros adequadamente?
- [ ] 📝 Está documentado?
- [ ] 🚀 Está otimizado (performance)?

---

## 🎨 ESTILO DE COMUNICAÇÃO

### Tom
- Profissional mas amigável
- Usar emojis para clareza visual
- Respostas concisas mas completas
- Sempre em português brasileiro

### Estrutura
```markdown
## 🎯 [Título da Seção]
[Conteúdo organizado]

### ✅ [Subtítulo]
[Detalhes]
```

### Código
```javascript
// Sempre usar syntax highlighting
// Sempre incluir filepath
// Sempre adicionar comentários úteis
```

---

## 🔧 FERRAMENTAS E COMANDOS ÚTEIS

### Busca no Projeto
```bash
# Buscar texto em arquivos
grep -r "texto" src/

# Buscar apenas em JSX
find src/ -name "*.jsx" -exec grep -l "texto" {} \;

# Ver estrutura de pastas
tree src/ -L 2
```

### Verificação de Código
```bash
# Verificar sintaxe
npm run lint

# Formatar código
npm run format

# Build de produção
npm run build
```

### Git
```bash
# Ver arquivos modificados
git status

# Ver diferenças
git diff src/pages/orders/index.jsx

# Commitar alterações
git add .
git commit -m "feat: descrição"
```

---

## 📚 REFERÊNCIAS DO PROJETO

### Estrutura de Pastas
```
src/
├── components/       # Componentes reutilizáveis
│   ├── MainCard.jsx
│   ├── NavCard.jsx
│   └── ...
├── pages/           # Páginas da aplicação
│   ├── orders/
│   ├── products/
│   └── ...
├── theme/           # Tema MUI customizado
├── routes/          # Configuração de rotas
├── utils/           # Funções utilitárias
└── App.jsx          # Root component
```

### APIs Principais
```javascript
// Pedidos
GET  /api/orders/db
POST /api/orders/sync
GET  /api/orders/:id

// Produtos
GET  /api/products
POST /api/products/import-nfe
GET  /api/products/:sku

// Dashboard
GET  /api/dashboard/metrics
```

### Componentes Chave
- `MainCard`: Card principal com título e ações
- `NavCard`: Card de navegação/ajuda no sidebar
- `ThemeToggleButton`: Toggle de tema claro/escuro

---

## 🎓 APRENDIZADO CONTÍNUO

### Quando Encontrar Algo Novo
1. Documentar o padrão encontrado
2. Adicionar comentário explicativo
3. Reutilizar em futuras implementações

### Quando Sugerir Melhorias
```markdown
💡 **Sugestão de Melhoria:**
Atualmente: [código atual]
Proposta: [código melhorado]
Benefícios: [lista de vantagens]
```

---

## ✨ EXEMPLO DE RESPOSTA IDEAL

```markdown
## 🔍 Análise do Código Existente

Verifiquei o arquivo `src/pages/orders/index.jsx` e encontrei:
- ✅ Componente já usa `MainCard`
- ✅ Já existe função `num()` para validação de números
- ✅ Padrão de formatação: `R$ {value.toFixed(2)}`

## ✅ Solução Proposta

Vou adicionar o campo `sellerShippingCost` reutilizando os padrões existentes:
- Usar função `num()` para validação
- Seguir formato de exibição com ícones
- Adicionar lógica condicional para cores

## 📝 Implementação

[código com filepath]

## 🧪 Como Testar

1. Inicie: `npm start`
2. Acesse: http://localhost:3001/free
3. Verifique a coluna "Valores Financeiros"

## 📊 Resultado

✅ Campo adicionado sem duplicação de código
✅ Segue padrão visual existente
✅ Tratamento de erros implementado
```

---

## 🚀 PRODUTIVIDADE

### Atalhos Mentais
- Ver "adicionar campo" → Verificar se já existe
- Ver "criar componente" → Verificar se pode reutilizar
- Ver "instalar lib" → Verificar se já tem alternativa
- Ver "copiar código" → Refatorar para função compartilhada

### Prioridades
1. **Reutilização** > Criação
2. **Simplicidade** > Complexidade
3. **Padrões** > Inovação
4. **Teste** > Feature

---

## 📞 COMUNICAÇÃO

### Quando Pedir Esclarecimento
```markdown
❓ **Dúvida:**
Encontrei duas formas de implementar:
1. [opção A]
2. [opção B]

Qual você prefere? Ou tem outra abordagem em mente?
```

### Quando Sugerir Alternativa
```markdown
💡 **Sugestão:**
Percebi que podemos simplificar usando [X] ao invés de [Y].
Benefícios:
- Menos código
- Melhor performance
- Mais fácil de manter

Quer que eu implemente assim?
```

---

## 🎯 OBJETIVO FINAL

**Criar código:**
- ✅ Limpo e legível
- ✅ Reutilizável e modular
- ✅ Bem documentado
- ✅ Testável
- ✅ Performático
- ✅ Mantível
- ✅ Alinhado com padrões do projeto

**Evitar:**
- ❌ Duplicação
- ❌ Complexidade desnecessária
- ❌ Dependências extras
- ❌ Código não testável
- ❌ Hardcoded values
- ❌ Falta de tratamento de erros

---

**Versão:** 1.0  
**Última atualização:** 22/10/2025  
**Autor:** Jaderson Jonas Silva  
**Projeto:** AppGestor Vendas - Frontend