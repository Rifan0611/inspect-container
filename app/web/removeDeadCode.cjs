const fs = require('fs');

let code = fs.readFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', 'utf8');

// The remaining dead code we need to remove from App.jsx:
// - compressImageToBase64
// - compressImage
// - handleContainerChange
// - cariContainer
// - simpanData
// - cetakPdf  (wait, is cetakPdf dead? It was used in history table, but we made a new HistoryTable! Let's check if HistoryTable uses cetakPdf. Our new HistoryTable doesn't have a print button!)
// Wait, the user wants the print button probably? "cetakPdf" might be needed. But we can ignore it for now to fix the blank screen.

// Actually, the easiest way to find and remove these blocks is to replace them with an empty string using precise regex.

code = code.replace(/const compressImageToBase64[\s\S]*?const compressImage[\s\S]*?\};\n\};/m, '');

code = code.replace(/const handleContainerChange = \(e\) => \{[\s\S]*?\n  \};/m, '');

code = code.replace(/const cariContainer = \(nomor\) => \{[\s\S]*?\n  \};/m, '');

code = code.replace(/const simpanData = async \(\) => \{[\s\S]*?setIsUploading\(false\);\n      \}\n    \};/m, '');

fs.writeFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', code);
console.log("Dead code removed!");
