const fs = require('fs');

const data = fs.readFileSync('src/pages/products/pricing.jsx', 'utf8');

const stack = [];
for (let i = 0; i < data.length; i++) {
    const char = data[i];
    if (char === '{' || char === '(' || char === '[') {
        stack.push({ char, line: data.slice(0, i).split('\n').length });
    } else if (char === '}' || char === ')' || char === ']') {
        const last = stack[stack.length - 1];
        if (!last) {
            console.log('Unmatched', char, 'at line', data.slice(0, i).split('\n').length);
            process.exit(1);
        }
        if (
            (char === '}' && last.char === '{') ||
            (char === ')' && last.char === '(') ||
            (char === ']' && last.char === '[')
        ) {
            stack.pop();
        } else {
            console.log('Mismatched', char, 'expected to close', last.char, 'at line', data.slice(0, i).split('\n').length, '(opened at line', last.line, ')');
            process.exit(1);
        }
    }
}
if (stack.length > 0) {
    console.log('Unclosed brackets:', stack.map(s => `${s.char} at line ${s.line}`));
} else {
    console.log('All brackets balanced');
}
