const fs = require('fs');
let path = 'src/pages/dashboard/IncomeAreaChart.jsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const ALL_METRICS[\s\S]*?\];\n\s*if \(loading\)/m;
const match = code.match(regex);

if (match) {
  const block = match[0].replace('if (loading)', '').trim() + '\n\n';
  code = code.replace(match[0], 'if (loading)');
  
  code = code.replace('  // Chart options\n  const options = {', block + '  // Chart options\n  const options = {');
  
  fs.writeFileSync(path, code);
  console.log('Fixed initialization order');
} else {
  console.log('Match not found');
}
