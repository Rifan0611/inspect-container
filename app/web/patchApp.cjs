const fs = require('fs');

let code = fs.readFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', 'utf8');

const cetakStart = code.indexOf('const cetakPdf = (item)');
const loginStart = code.indexOf('// LOGIN PAGE');
if (loginStart === -1) {
  console.error("Could not find // LOGIN PAGE");
  process.exit(1);
}

// Rewind to the start of the comment block for LOGIN PAGE
const loginBlockStart = code.lastIndexOf('// ====', loginStart);

const beforeCetak = code.substring(0, cetakStart);
const afterCetak = code.substring(loginBlockStart);

const newCetak = `const cetakPdf = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    let dateFormatted = "-";
    if (item.date) {
      try {
        const d = new Date(item.date);
        dateFormatted = d.toLocaleString("id-ID", {
          weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
        }) + " WIB";
      } catch(e) {}
    }

    const photos = parsePhotos(item.photo1).map(url => url.trim()).filter(Boolean);

    win.document.write(\`
<html>
<head>
<title>BERITA ACARA</title>
<style>
* { box-sizing:border-box; }
@page { size:A4; margin:10mm; }
body { font-family:Arial,sans-serif; padding:12px; font-size:10px; color:#000; margin:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #004aad; padding-bottom:8px; margin-bottom:12px; }
.company { text-align:right; width: 100%; text-align: center; }
.company h2 { margin:0; font-size:15px; font-weight:bold; color:#004aad; }
.company p { margin:1px 0; font-size:9px; }
.title { text-align:center; font-size:15px; font-weight:bold; margin:10px 0 15px 0; letter-spacing:1px; }
table { width:100%; border-collapse:collapse; margin-bottom:12px; }
td { border:1px solid #000; padding:6px; font-size:10px; }
.label { font-weight:bold; background:#f3f3f3; width:35%; }
.note-title { font-weight:bold; margin-bottom:6px; margin-top:8px; font-size:10px; }
.note { border:1px solid #000; padding:8px; height:80px; font-size:10px; margin-bottom:12px; }
.photo-title { font-weight:bold; margin-bottom:10px; font-size:10px; }
.photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; }
.photo-box { text-align:center; }
.photo-label { font-size:10px; font-weight:bold; margin-bottom:6px; }
.photo-box img { width:100%; height:165px; object-fit:cover; border-radius:8px; border:2px solid #004aad; }
.footer { display:flex; justify-content:space-between; margin-top:25px; }
.ttd { width:220px; text-align:center; font-size:10px; }
.ttd-line { margin-top:55px; }
@media print { html,body { width:210mm; height:297mm; overflow:hidden; } }
</style>
</head>
<body>
<div class="header">
  <div class="company">
    <h2>NPH ADIPURUSA</h2>
    <p>Container Inspection System</p>
  </div>
</div>
<div class="title">BERITA ACARA CONTAINER INSPECTION</div>
<table>
  <tr><td class="label">Nomor Container</td><td>\${item.container || "-"}</td></tr>
  <tr><td class="label">Status</td><td>\${item.status || "-"}</td></tr>
  <tr><td class="label">Kategori</td><td>\${item.category || "-"}</td></tr>
  <tr><td class="label">ISO Code</td><td>\${item.iso || "-"}</td></tr>
  <tr><td class="label">Kapal</td><td>\${item.shipName || "-"}</td></tr>
  <tr><td class="label">Kondisi Kerusakan</td><td>\${item.condition || "-"}</td></tr>
  <tr><td class="label">Sisi Container</td><td>\${item.side || "-"}</td></tr>
  <tr><td class="label">Waktu Inspeksi</td><td>\${dateFormatted}</td></tr>
</table>
<div class="note-title">Catatan Kronologi / Kerusakan Lainnya :</div>
<div class="note">\${item.note || "-"}</div>
<div class="photo-title">FOTO DOKUMENTASI CONTAINER :</div>
<div class="photo-grid">
  \${photos.map((url, i) => \`
    <div class="photo-box">
      <div class="photo-label">FOTO CONTAINER \${i + 1}</div>
      <img src="\${url}" />
    </div>
  \`).join("")}
</div>
<div class="footer">
  <div class="ttd">
    <div>Dibuat oleh (Petugas Lapangan),</div>
    <div class="ttd-line">( \${item.petugas || "______________________"} )</div>
  </div>
  <div class="ttd">
    <div>Mengetahui (Spv / Manager),</div>
    <div class="ttd-line">( ______________________ )</div>
  </div>
</div>
<script>
  window.onload = function() {
    var imgs = document.getElementsByTagName('img');
    if (imgs.length === 0) { window.print(); return; }
    var loaded = 0;
    function checkDone() { loaded++; if (loaded === imgs.length) window.print(); }
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].complete) { loaded++; } else { imgs[i].addEventListener('load', checkDone); imgs[i].addEventListener('error', checkDone); }
    }
    if (loaded === imgs.length) window.print();
  }
</script>
</body>
</html>\`);
    win.document.close();
  };

  const cetakFoto = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    let dateFormatted = "-";
    if (item.date) {
      try {
        const d = new Date(item.date);
        dateFormatted = d.toLocaleString("id-ID", {
          weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
        }) + " WIB";
      } catch(e) {}
    }

    const photos = parsePhotos(item.photo1).map(url => url.trim()).filter(Boolean);

    win.document.write(\`
<html>
<head>
<title>BERITA ACARA - FOTO</title>
<style>
* { box-sizing:border-box; }
@page { size:A4; margin:10mm; }
body { font-family:Arial,sans-serif; padding:12px; font-size:10px; color:#000; margin:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #004aad; padding-bottom:8px; margin-bottom:12px; }
.company { text-align:right; width:100%; text-align:center; }
.company h2 { margin:0; font-size:15px; font-weight:bold; color:#004aad; }
.company p { margin:1px 0; font-size:9px; }
.photo-title { font-weight:bold; margin-bottom:10px; font-size:12px; text-align:center; margin-top:10px; }
.photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; }
.photo-box { text-align:center; }
.photo-label { font-size:10px; font-weight:bold; margin-bottom:6px; }
.photo-box img { width:100%; height:300px; object-fit:contain; border-radius:8px; border:2px solid #004aad; }
@media print { html,body { width:210mm; height:297mm; overflow:hidden; } }
</style>
</head>
<body>
<div class="header">
  <div class="company">
    <h2>NPH ADIPURUSA</h2>
    <p>Container Inspection System</p>
  </div>
</div>
<div class="photo-title">FOTO INSPEKSI - \${item.container || "-"}</div>
<div style="text-align:center; margin-bottom: 20px; font-size:11px;">Waktu Inspeksi: <b>\${dateFormatted}</b></div>
<div class="photo-grid">
  \${photos.map((url, i) => \`
    <div class="photo-box">
      <div class="photo-label">FOTO CONTAINER/CDR \${i + 1}</div>
      <img src="\${url}" />
    </div>
  \`).join("")}
</div>
<script>
  window.onload = function() {
    var imgs = document.getElementsByTagName('img');
    if (imgs.length === 0) { window.print(); return; }
    var loaded = 0;
    function checkDone() { loaded++; if (loaded === imgs.length) window.print(); }
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].complete) { loaded++; } else { imgs[i].addEventListener('load', checkDone); imgs[i].addEventListener('error', checkDone); }
    }
    if (loaded === imgs.length) window.print();
  }
</script>
</body>
</html>\`);
    win.document.close();
  };

  `;

fs.writeFileSync('c:/Users/User/Desktop/inspect-container/app/web/src/App.jsx', beforeCetak + newCetak + afterCetak);
console.log("Patched App.jsx!");
