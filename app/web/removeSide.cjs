const fs = require('fs');

let code = fs.readFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', 'utf8');

code = code.replace(/const handleSideChange = \(val\) => \{[\s\S]*?\};/m, '');
code = code.replace(/const handleConditionChange = \(val\) => \{[\s\S]*?\n  \};/m, '');

fs.writeFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', code);
