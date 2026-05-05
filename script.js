const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startIndex = code.indexOf('const REACTIONS = [');
if (startIndex !== -1) {
  let endIndex = code.indexOf('];\n', startIndex);
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex + 3);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Removed REACTIONS from App.tsx");
  }
}
