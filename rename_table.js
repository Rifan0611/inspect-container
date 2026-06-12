const fs = require('fs');

const filePath = 'app/web/src/pages/office-dashboard/OfficeDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rename table title
content = content.replace('<h3>Riwayat Inspeksi</h3>', '<h3>Tabel Transaksi Inspeksi</h3>');

// 2. Add sorting to paginated table
content = content.replace(
  'const paginated = filtered.slice(\n                      (currentPage - 1) * 10,\n                      currentPage * 10,\n                    );',
  'const sortedFiltered = [...filtered].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));\n                    const paginated = sortedFiltered.slice(\n                      (currentPage - 1) * 10,\n                      currentPage * 10,\n                    );'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Table renamed and sorted descending.');
