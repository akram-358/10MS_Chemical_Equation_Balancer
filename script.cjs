const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const rx = /const TOKENS \= \{[\s\S]*?\};\n\nconst REACTIONS = \[[\s\S]*?\];\n/;
code = code.replace(rx, '');
fs.writeFileSync('src/App.tsx', code);
