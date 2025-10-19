# 🎨 Guia Rápido de Customização

## 🚀 Start Rápido (5 minutos)

### 1. Mude a Cor Principal

Edite `/src/theme/index.js`:

```javascript
primary: {
  lighter: '#E3F2FD',
  light: '#90CAF9',
  main: '#FF5722',      // 👈 MUDE AQUI (ex: laranja)
  dark: '#E64A19',
  darker: '#BF360C',
  contrastText: '#ffffff'
}
```

### 2. Adicione Toggle de Tema no Header

Edite `/src/layout/Dashboard/Header/HeaderContent/index.jsx`:

```javascript
import ThemeToggleButton from 'components/ThemeToggleButton';

// Adicione no return, perto dos outros botões:
<ThemeToggleButton />
```

### 3. Teste!

```bash
npm start
```

---

## 🎨 Geradores de Cores

Use estas ferramentas para gerar paletas:

1. **Material Design Color Tool**
   - https://m2.material.io/design/color/
   - Gera paleta completa baseada em uma cor

2. **Coolors**
   - https://coolors.co/
   - Gerador de paletas aleatórias

3. **Adobe Color**
   - https://color.adobe.com/
   - Paletas profissionais

---

## 🎯 Customizações Comuns

### Mudar Fonte

```javascript
// Em /src/theme/index.js
typography: {
  fontFamily: '"Poppins", "Roboto", sans-serif',
  // ...
}
```

**Não esqueça de importar no index.html:**

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Mudar Arredondamento dos Cards

```javascript
// Em /src/theme/index.js
shape: {
  borderRadius: 16  // 👈 Mais arredondado (padrão: 8)
}
```

### Adicionar Cor Personalizada

```javascript
// Em /src/theme/index.js, dentro de palette:
custom: {
  orange: '#FF5722',
  purple: '#9C27B0',
  teal: '#009688'
}

// Use assim:
<Box sx={{ bgcolor: 'custom.orange' }}>
```

### Mudar Sombras

```javascript
// Em /src/theme/index.js
shadows: [
  'none',
  '0px 2px 4px rgba(0,0,0,0.15)',  // 👈 Sombra mais forte
  '0px 4px 8px rgba(0,0,0,0.15)',
  // ...
]
```

---

## 🌙 Tema Escuro Customizado

Adicione cores específicas para modo escuro:

```javascript
// Em createCustomTheme()
background: {
  default: isDark ? '#0A0E27' : '#F5F5F5',  // 👈 Azul escuro
  paper: isDark ? '#151A32' : '#FFFFFF'
}
```

---

## 📱 Breakpoints Personalizados

```javascript
// Em /src/theme/index.js
breakpoints: {
  values: {
    xs: 0,
    sm: 600,
    md: 960,      // 👈 Ajuste conforme necessário
    lg: 1280,
    xl: 1920
  }
}
```

---

## 🎭 Temas Pré-Prontos

### Tema Blue Ocean 🌊

```javascript
primary: {
  main: '#0277BD',  // Azul oceano
}
secondary: {
  main: '#00ACC1',  // Ciano
}
```

### Tema Purple Dream 💜

```javascript
primary: {
  main: '#7B1FA2',  // Roxo
}
secondary: {
  main: '#E91E63',  // Rosa
}
```

### Tema Green Nature 🌿

```javascript
primary: {
  main: '#388E3C',  // Verde
}
secondary: {
  main: '#FFA726',  // Laranja
}
```

### Tema Dark Professional 🖤

```javascript
primary: {
  main: '#212121',  // Preto
}
secondary: {
  main: '#FFC107',  // Amarelo/Dourado
}
```

---

## 🔥 Dicas Pro

### 1. Usar Cores do Tema Dinamicamente

```javascript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }}>
      Texto
    </Box>
  );
}
```

### 2. Criar Variantes de Botões

```javascript
// Em /src/theme/index.js, components
MuiButton: {
  variants: [
    {
      props: { variant: 'gradient' },
      style: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        color: 'white',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      }
    }
  ]
}

// Use assim:
<Button variant="gradient">Botão Gradiente</Button>
```

### 3. Modo de Cores Persistente

```javascript
// Em /src/theme/ThemeProvider.jsx
const [mode, setMode] = useState(() => {
  // Salva no localStorage
  return localStorage.getItem('theme-mode') || 'light';
});

const toggleTheme = () => {
  setMode((prevMode) => {
    const newMode = prevMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme-mode', newMode);
    return newMode;
  });
};
```

---

## 📊 Componentes MUI Disponíveis

Todos estes estão prontos para usar:

### Layout
- Box, Container, Grid, Stack
- Paper, Card, Accordion

### Inputs
- Button, IconButton, Fab
- TextField, Select, Checkbox, Radio, Switch
- Autocomplete, Slider, Rating

### Data Display
- Table, List, Chip, Badge, Avatar
- Tooltip, Typography, Divider

### Feedback
- Alert, Snackbar, Dialog, Progress
- Skeleton, Backdrop

### Navigation
- Drawer, Menu, Tabs, Breadcrumbs
- Pagination, SpeedDial

### Utilitários
- ClickAwayListener, Portal, Transitions
- useMediaQuery, useTheme

---

## 🎓 Exemplos Práticos

### Card com Gradiente

```javascript
<Card sx={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  p: 3
}}>
  <Typography variant="h5">Card Especial</Typography>
</Card>
```

### Botão com Efeito Glassmorphism

```javascript
<Button sx={{
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white'
}}>
  Glassmorphism
</Button>
```

### Layout Responsivo Fácil

```javascript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    {/* Ocupa toda largura em mobile, metade em tablet, etc */}
  </Grid>
</Grid>
```

---

## 🎪 Recursos Adicionais

- [MUI Showcase](https://mui.com/store/) - Templates prontos
- [MUI Icons](https://mui.com/material-ui/material-icons/) - 2000+ ícones
- [MUI X](https://mui.com/x/) - Componentes avançados (DataGrid, DatePicker)
- [MUI Templates](https://mui.com/material-ui/getting-started/templates/) - Exemplos

---

**Divirta-se customizando! 🎨**
