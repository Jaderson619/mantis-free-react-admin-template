const fs = require('fs');
let code = fs.readFileSync('src/pages/products/list.jsx', 'utf8');

code = code.replace(
  /<Tooltip title="Precificar">/g,
  `<Tooltip title="Análise de Desempenho">\n                                <IconButton size="small" onClick={() => navigate(\`/produtos/analise?sku=\${encodeURIComponent(p.sku)}\`)} color="primary">\n                                  <FundViewOutlined />\n                                </IconButton>\n                              </Tooltip>\n                              <Tooltip title="Precificar">`
);

fs.writeFileSync('src/pages/products/list.jsx', code);
