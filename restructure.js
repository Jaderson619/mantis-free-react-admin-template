const fs = require('fs');
let content = fs.readFileSync('src/pages/products/pricing.jsx', 'utf8');

// The marker for Header: 
// {/* Cabeçalho */}
// <Grid item xs={12}>
//   <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
//     <CalculatorOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
//     <Typography variant="h4">Simulador de Precificação (Markup & E-commerce)</Typography>
//   </Stack>

const headerRegex = /\{\/\* Cabeçalho \*\/\}([\s\S]*?)<\/Stack>\s*(<MainCard sx=\{\{ mb: 2 \}\}>)/m;
let newHeader = `{/* Cabeçalho */}
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CalculatorOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Typography variant="h4">Simulador de Precificação (Markup & E-commerce)</Typography>
          </Stack>
          <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={() => setIsDialogOpen(true)}>
            Nova Simulação
          </Button>
        </Stack>`;
content = content.replace(headerRegex, newHeader + '\n\n$2');

// Now, we need to extract the Historical Table
const tableRegex = /\{\/\* Histórico Persistido no Backend \*\/\}([\s\S]*?)<\/Grid>/g;
let tableMatch = tableRegex.exec(content);
let tableContent = tableMatch[0];

content = content.replace(tableContent, ''); // remove from bottom

// Insert table right below the Error/Success messages
const alertsRegex = /(\{\s*successMsg[\s\S]*?<\/Grid>\s*\})\s*\{\/\* Coluna Esquerda: Configurações \*\/\}/m;

const formTopStr = `{/* Tabela de Histórico (Movida para cima) */}
      ${tableContent}

      {/* Modal de Simulação */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Nova Simulação</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* O AutoComplete Antigo do Cabeçalho foi absorvido para dentro do Form */}
            <Grid item xs={12}>
`;

content = content.replace(alertsRegex, `$1\n\n${formTopStr}\n\n{/* Coluna Esquerda: Configurações */}`);

// We need to move the AutoComplete block into the dialog too.
// Wait, the AutoComplete is right below the <Stack> we injected.
// Let's find it.
const autoCompleteRegex = /<MainCard sx=\{\{ mb: 2 \}\}>([\s\S]*?)<\/MainCard>\s*\{errorMsg/m;
let autoCompleteMatch = autoCompleteRegex.exec(content);
if(autoCompleteMatch) {
  content = content.replace(autoCompleteMatch[0], '{errorMsg');
  content = content.replace('{/* O AutoComplete Antigo do Cabeçalho foi absorvido para dentro do Form */}', autoCompleteMatch[0]);
}


// Close the Dialog at the end of the return statement
const endReturnRegex = /<\/Grid>\s*<\/Grid>\s*\);\s*\}/m;
const endDialog = `
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}`;

content = content.replace('</Grid>\n    </Grid>\n  );\n}', endDialog);

fs.writeFileSync('src/pages/products/pricing.jsx', content);
