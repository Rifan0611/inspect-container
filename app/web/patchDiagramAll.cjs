const fs = require('fs');

const files = [
  'app/web/src/App.jsx',
  'app/web/src/pages/office-dashboard/OfficeDashboard.jsx',
  'app/web/src/components/HistoryTable.jsx'
];

const diagramCss = `
.diagram-container { position:relative; width:100%; max-width:600px; margin:20px auto; border:2px solid #cbd5e1; border-radius:16px; overflow:hidden; background:white; }
.diagram-image { width:100%; height:auto; display:block; }
.diagram-hotspot { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; }
.hotspot-badge { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:rgba(239,68,68,0.95); color:white; border:2px solid white; font-size:12px; font-weight:bold; }
.hotspot-badge.checked { background:rgba(34,197,94,0.95); }
.hotspot-label { background:rgba(15,23,42,0.85); color:white; font-size:8px; font-weight:bold; padding:2px 4px; border-radius:4px; margin-top:2px; white-space:nowrap; }
`;

const diagramJs = `
    const selectedSides = item.side ? item.side.split(",").map(s => s.trim()) : [];
    const sidesMap = [
      { val: "Front/Depan", label: "Front (Depan)", x: 12, y: 30 },
      { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 28, y: 45 },
      { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 18, y: 75 },
      { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 58 },
      { val: "Roof/Atas", label: "Roof (Atas)", x: 80, y: 26 },
      { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 88, y: 48 },
      { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 71, y: 60 },
    ];
`;

const diagramHtml = `
<div class="photo-title" style="margin-top:20px;">VISUAL SISI KERUSAKAN</div>
<div class="diagram-container">
  <img class="diagram-image" src="\${window.location.origin}/container-diagram.png" />
  \${sidesMap.map(hotspot => {
    const isChecked = selectedSides.includes(hotspot.val);
    return \`
      <div class="diagram-hotspot" style="left:\${hotspot.x}%; top:\${hotspot.y}%;">
        <div class="hotspot-badge \${isChecked ? 'checked' : ''}">\${isChecked ? '&#10003;' : '!'}</div>
        <div class="hotspot-label">\${hotspot.label}</div>
      </div>
    \`;
  }).join("")}
</div>
`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Inject JS
  content = content.replace(/(const cetakPdf = \(item\) => \{\s*const win = window\.open\("", "", "width=1200,height=900"\);)/g, "$1\n" + diagramJs);
  content = content.replace(/(const cetakFoto = \(item\) => \{\s*const win = window\.open\("", "", "width=1200,height=900"\);)/g, "$1\n" + diagramJs);

  // Inject CSS (in every style tag)
  content = content.replace(/(<\s*style\s*>[\s\S]*?)(<\/\s*style\s*>)/g, "$1" + diagramCss + "$2");

  // Inject HTML
  content = content.replace(/(<div class="photo-title">FOTO DOKUMENTASI CONTAINER :<\/div>)/g, diagramHtml + "\n$1");
  content = content.replace(/(<div class="photo-title">FOTO INSPEKSI(?: - \$\{item\.container \|\| "-"\}\s*)?<\/div>)/g, diagramHtml + "\n$1");

  fs.writeFileSync(file, content, 'utf8');
  console.log("Patched " + file);
}
