#!/bin/bash

echo "🧪 Testando API sales-by-period..."
echo ""

echo "📅 Teste 1: Este ano (agrupado por mês)"
curl -s "http://localhost:5001/api/orders/sales-by-period?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59&period=year&groupBy=month&includeFrete=false" | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "📅 Teste 2: Este mês (agrupado por dia)"
curl -s "http://localhost:5001/api/orders/sales-by-period?startDate=2025-10-01T00:00:00&endDate=2025-10-31T23:59:59&period=month&groupBy=day&includeFrete=false" | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "📅 Teste 3: Hoje (agrupado por hora)"
curl -s "http://localhost:5001/api/orders/sales-by-period?startDate=2025-10-22T00:00:00&endDate=2025-10-22T23:59:59&period=today&groupBy=hour&includeFrete=false" | python3 -m json.tool
echo ""

echo "✅ Testes concluídos!"
