const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(/const compressImageToBase64 =.*?};[\r\n]+const compressImage =.*?};/s, '');

code = code.replace(/  const \[container, setContainer\].*?useState\(.*?\[\]\);/s, '');

code = code.replace(/  \/\/ ======================================================\r?\n  \/\/ SAVE DATA\r?\n  \/\/ ======================================================\r?\n\r?\n  const simpanData = async \(\) => \{.*?setPhoto2\(\"\"\);\r?\n  \};/s, '');

code = code.replace(/  const handleContainerChange = \(e\) => \{.*?\};/s, '');
code = code.replace(/  const cariContainer = async \(nomor\) => \{.*?\};/s, '');

code = code.replace(/  if \(page === \"inspection\"\) \{.*?return \(\r?\n      <div className=\"inspection-container-page\">.*?<\/div>\r?\n    \);\r?\n  \}/s, `  if (page === "inspection") {
    return (
      <InspectionForm
        user={user}
        manifestList={manifestList}
        onSaveSuccess={(newInspection) => {
          const newHistory = [newInspection, ...history];
          setHistory(newHistory);
          localStorage.setItem("history", JSON.stringify(newHistory.slice(0, 5)));
        }}
        onBack={() => setPage("dashboard")}
      />
    );
  }`);

if (!code.includes('import InspectionForm')) {
  code = code.replace(/import React, \{ useState \} from \"react\";/, `import React, { useState } from "react";\nimport InspectionForm from "./components/InspectionForm";\nimport HistoryTable from "./components/HistoryTable";`);
}

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx refactored');
