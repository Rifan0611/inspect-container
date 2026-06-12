const fs = require('fs');

const filePath = 'app/web/src/pages/office-dashboard/OfficeDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'date: editDate,\n              };\n            }',
  'date: editDate,\n                photo2: editPhoto2,\n              };\n            }'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed local state update');
