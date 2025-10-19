#!/bin/bash

echo "🧹 Limpando referências ao Mantis Template..."
echo ""

# Arquivos a serem revisados manualmente
echo "📝 Arquivos que precisam de revisão manual:"
echo ""
echo "1. package.json - Atualize:"
echo "   - name: seu-projeto-nome"
echo "   - homepage: seu-site.com"
echo "   - author: seu-nome"
echo ""
echo "2. src/menu-items/support.jsx"
echo "   - Remova ou atualize links do Mantis"
echo ""
echo "3. src/layout/Dashboard/Drawer/DrawerContent/NavCard.jsx"
echo "   - Remova card 'Mantis Pro'"
echo ""
echo "4. src/layout/Dashboard/Header/HeaderContent/index.jsx"
echo "   - Remova link do GitHub do Mantis"
echo ""
echo "5. public/index.html (se existir)"
echo "   - Atualize título e meta tags"
echo ""

# Buscar referências restantes
echo "🔍 Buscando referências ao 'mantis' no código..."
grep -r "mantis" --include="*.jsx" --include="*.js" src/ 2>/dev/null | grep -v "node_modules" | head -20

echo ""
echo "🔍 Buscando referências ao 'codedthemes'..."
grep -r "codedthemes" --include="*.jsx" --include="*.js" src/ 2>/dev/null | grep -v "node_modules" | head -20

echo ""
echo "✅ Revisão completa!"
echo ""
echo "📋 Próximos passos:"
echo "1. Revise os arquivos listados acima"
echo "2. Execute: npm install (para garantir)"
echo "3. Execute: npm start"
echo "4. Teste todas as funcionalidades"
echo ""
echo "🎉 Seu app estará pronto para produção comercial!"
