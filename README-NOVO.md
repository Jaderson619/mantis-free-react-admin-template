# 🚀 AppGestorVendas - Frontend

Sistema de gestão de vendas com interface moderna e totalmente customizável.

## ✨ Características

- ✅ **100% Licença MIT** - Uso comercial permitido
- 🎨 **Material-UI v5** - Framework UI completo
- 🌓 **Tema Claro/Escuro** - Alternância nativa
- 📱 **Responsivo** - Mobile-first design
- ⚡ **Vite** - Build super rápido
- 🇧🇷 **PT-BR** - Localização completa
- 🎯 **TypeScript Ready** - Tipagem opcional

## 🛠️ Tecnologias

- **React 18.2** - UI Library
- **Material-UI v5** - Component Framework
- **React Router v6** - Navegação
- **Axios** - HTTP Client
- **Day.js** - Manipulação de datas
- **Formik + Yup** - Formulários e validação
- **Framer Motion** - Animações
- **ApexCharts** - Gráficos
- **Vite** - Build Tool

## 📦 Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/AppGestorVendas-Frontend.git

# Entre no diretório
cd AppGestorVendas-Frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
\`\`\`

## 🎨 Personalização do Tema

O tema está em \`/src/theme/index.js\`. Customize:

\`\`\`javascript
// Cores principais
primary: {
  main: '#1976D2',  // Sua cor primária
  // ...
}

// Tipografia
fontFamily: '"Roboto", "Inter", ...'

// Bordas
shape: {
  borderRadius: 8  // Arredondamento padrão
}
\`\`\`

## 🌙 Toggle de Tema

Use em qualquer componente:

\`\`\`javascript
import { useThemeMode } from 'theme/ThemeProvider';

function MyComponent() {
  const { mode, toggleTheme } = useThemeMode();
  
  return (
    <Button onClick={toggleTheme}>
      {mode === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
src/
├── components/        # Componentes reutilizáveis
│   ├── MainCard.jsx
│   ├── ThemeToggleButton.jsx
│   └── @extended/    # Componentes estendidos
├── layout/           # Layouts da aplicação
│   ├── Dashboard/
│   └── MinimalLayout/
├── pages/            # Páginas da aplicação
│   ├── authentication/
│   ├── dashboard/
│   ├── products/
│   └── settings/
├── routes/           # Configuração de rotas
├── theme/            # Sistema de tema customizado ⭐
│   ├── index.js
│   └── ThemeProvider.jsx
├── utils/            # Utilitários
└── App.jsx           # Componente raiz
\`\`\`

## 🔧 Scripts Disponíveis

\`\`\`bash
npm start          # Inicia desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Verifica código
npm run lint:fix   # Corrige problemas
\`\`\`

## 📱 Funcionalidades Implementadas

### Gestão de Produtos
- ✅ Lista paginada de produtos
- ✅ Cadastro de novos produtos
- ✅ Edição de produtos
- ✅ Busca e filtros
- ✅ Gerenciamento de lotes de custo
- ✅ Importação via NFe (XML)
- ✅ Status de importação em tempo real

### Autenticação
- ✅ Login
- ✅ Registro
- ✅ Recuperação de senha
- ✅ JWT Token

### Dashboard
- ✅ Métricas de vendas
- ✅ Gráficos interativos
- ✅ Tabelas de pedidos
- ✅ Cards estatísticos

## 🎯 Próximas Funcionalidades

- [ ] Gestão de vendas
- [ ] Relatórios avançados
- [ ] Gestão de clientes
- [ ] Controle de estoque
- [ ] Integração com e-commerce
- [ ] Notificações em tempo real

## 🔒 Variáveis de Ambiente

Crie um arquivo \`.env\` na raiz:

\`\`\`env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=AppGestorVendas
\`\`\`

## 🚀 Deploy

### Vercel (Recomendado)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Build Manual

\`\`\`bash
npm run build
# Arquivos em /dist
\`\`\`

## 📄 Licença

Este projeto usa **Material-UI v5** (MIT License) - **uso comercial permitido**.

Desenvolvido com ❤️ para seu SaaS.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 🌐 Website: seu-site.com
- 💬 Discord: [Link do servidor]

## 🙏 Agradecimentos

- [Material-UI](https://mui.com/) - Framework UI
- [React](https://react.dev/) - Library
- [Vite](https://vitejs.dev/) - Build Tool

---

**Pronto para produção!** 🎉
