const fs = require('fs');

const filePath = 'app/web/src/pages/office-dashboard/OfficeDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '{/* UPLOAD MANIFEST */}';
const endMarker = '{/* RIWAYAT INSPEKSI */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully removed the sections.');
} else {
  console.log('Could not find markers.');
}
