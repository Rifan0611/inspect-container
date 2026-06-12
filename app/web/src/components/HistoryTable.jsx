import React from "react";
import { FileText, Image } from "lucide-react";

export default function HistoryTable({ history }) {
  const getConditionColor = (cond) => {
    const c = (cond || "").toLowerCase();
    if (c === "good") return { bg: "#dcfce7", text: "#15803d" };
    return { bg: "#ffe4e6", text: "#b91c1c" };
  };

  const parsePhotos = (photoStr) => {
    if (!photoStr) return [];
    if (photoStr.includes("|")) return photoStr.split("|");
    if (photoStr.startsWith("data:image")) return [photoStr];
    return photoStr.split(",");
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
    }) + " WIB";
  };

  const cetakPdf = (item) => {
    const win = window.open("", "", "width=1200,height=900");

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


    const dateFormatted = formatTanggal(item.date);
    const photos = parsePhotos(item.photo1).map(url => url.trim()).filter(Boolean);

    win.document.write(`
<html>
<head>
<title>BERITA ACARA</title>
<style>
* { box-sizing:border-box; }
@page { size:A4; margin:10mm; }
body { font-family:Arial,sans-serif; padding:12px; font-size:10px; color:#000; margin:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #004aad; padding-bottom:8px; margin-bottom:12px; }
.logo { width:130px; display:block; margin-bottom:-4px; }
.company { text-align:right; }
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

.diagram-container { position:relative; width:100%; max-width:600px; margin:20px auto; border:2px solid #cbd5e1; border-radius:16px; overflow:hidden; background:white; }
.diagram-image { width:100%; height:auto; display:block; }
.diagram-hotspot { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; }
.hotspot-badge { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:rgba(239,68,68,0.95); color:white; border:2px solid white; font-size:12px; font-weight:bold; }
.hotspot-badge.checked { background:rgba(34,197,94,0.95); }
.hotspot-label { background:rgba(15,23,42,0.85); color:white; font-size:8px; font-weight:bold; padding:2px 4px; border-radius:4px; margin-top:2px; white-space:nowrap; }
</style>
</head>
<body>
<div class="header">
  <div class="company" style="text-align: center; width: 100%;">
    <h2>NPH ADIPURUSA</h2>
    <p>Container Inspection System</p>
  </div>
</div>
<div class="title">BERITA ACARA CONTAINER INSPECTION</div>
<table>
  <tr><td class="label">Nomor Container</td><td>${item.container || "-"}</td></tr>
  <tr><td class="label">Status</td><td>${item.status || "-"}</td></tr>
  <tr><td class="label">Kategori</td><td>${item.category || "-"}</td></tr>
  <tr><td class="label">ISO Code</td><td>${item.iso || "-"}</td></tr>
  <tr><td class="label">Kapal</td><td>${item.shipName || "-"}</td></tr>
  <tr><td class="label">Kondisi Kerusakan</td><td>${item.condition || "-"}</td></tr>
  <tr><td class="label">Sisi Container</td><td>${item.side || "-"}</td></tr>
  <tr><td class="label">Waktu Inspeksi</td><td>${dateFormatted}</td></tr>
</table>
<div class="note-title">Catatan Kronologi / Kerusakan Lainnya :</div>
<div class="note">${item.note || "-"}</div>

<div class="photo-title" style="margin-top:20px;">VISUAL SISI KERUSAKAN</div>
<div class="diagram-container">
  <img class="diagram-image" src="${window.location.origin}/container-diagram.png" />
  ${sidesMap.map(hotspot => {
    const isChecked = selectedSides.includes(hotspot.val);
    return `
      <div class="diagram-hotspot" style="left:${hotspot.x}%; top:${hotspot.y}%;">
        <div class="hotspot-badge ${isChecked ? 'checked' : ''}">${isChecked ? '&#10003;' : '!'}</div>
        <div class="hotspot-label">${hotspot.label}</div>
      </div>
    `;
  }).join("")}
</div>

<div class="photo-title">FOTO DOKUMENTASI CONTAINER :</div>
<div class="photo-grid">
  ${item.photo2 ? `
    <div class="photo-box">
      <div class="photo-label">FOTO KONDISI / DAMAGE</div>
      <img src="${item.photo2}" />
    </div>
  ` : ""}
  ${photos.map((url, i) => `
    <div class="photo-box">
      <div class="photo-label">FOTO CONTAINER ${i + 1}</div>
      <img src="${url}" />
    </div>
  `).join("")}
</div>
<div class="footer">
  <div class="ttd">
    <div>Dibuat oleh (Petugas Lapangan),</div>
    <div class="ttd-line">( ${item.petugas || "______________________"} )</div>
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
</html>`);
    win.document.close();
  };

  const cetakFoto = (item) => {
    const win = window.open("", "", "width=1200,height=900");

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


    const dateFormatted = formatTanggal(item.date);
    const photos = parsePhotos(item.photo1).map(url => url.trim()).filter(Boolean);

    win.document.write(`
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

.diagram-container { position:relative; width:100%; max-width:600px; margin:20px auto; border:2px solid #cbd5e1; border-radius:16px; overflow:hidden; background:white; }
.diagram-image { width:100%; height:auto; display:block; }
.diagram-hotspot { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; }
.hotspot-badge { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:rgba(239,68,68,0.95); color:white; border:2px solid white; font-size:12px; font-weight:bold; }
.hotspot-badge.checked { background:rgba(34,197,94,0.95); }
.hotspot-label { background:rgba(15,23,42,0.85); color:white; font-size:8px; font-weight:bold; padding:2px 4px; border-radius:4px; margin-top:2px; white-space:nowrap; }
</style>
</head>
<body>
<div class="header">
  <div class="company">
    <h2>NPH ADIPURUSA</h2>
    <p>Container Inspection System</p>
  </div>
</div>

<div class="photo-title" style="margin-top:20px;">VISUAL SISI KERUSAKAN</div>
<div class="diagram-container">
  <img class="diagram-image" src="${window.location.origin}/container-diagram.png" />
  ${sidesMap.map(hotspot => {
    const isChecked = selectedSides.includes(hotspot.val);
    return `
      <div class="diagram-hotspot" style="left:${hotspot.x}%; top:${hotspot.y}%;">
        <div class="hotspot-badge ${isChecked ? 'checked' : ''}">${isChecked ? '&#10003;' : '!'}</div>
        <div class="hotspot-label">${hotspot.label}</div>
      </div>
    `;
  }).join("")}
</div>

<div class="photo-title">FOTO INSPEKSI - ${item.container || "-"}</div>
<div style="text-align:center; margin-bottom: 20px; font-size:11px;">Waktu Inspeksi: <b>${dateFormatted}</b></div>
<div class="photo-grid">
  ${item.photo2 ? `
    <div class="photo-box">
      <div class="photo-label">FOTO KONDISI / DAMAGE</div>
      <img src="${item.photo2}" />
    </div>
  ` : ""}
  ${photos.map((url, i) => `
    <div class="photo-box">
      <div class="photo-label">FOTO CONTAINER/CDR ${i + 1}</div>
      <img src="${url}" />
    </div>
  `).join("")}
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
</html>`);
    win.document.close();
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="w-full border-collapse bg-white text-sm text-left shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-600 w-12 text-center">No</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[120px]">Container</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[150px]">Kapal</th>
            <th className="px-4 py-3 font-semibold text-slate-600 text-center">Kondisi</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[150px]">Sisi</th>
            <th className="px-4 py-3 font-semibold text-slate-600 min-w-[160px] text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.slice(0, 5).map((item, index) => {
             const condColor = getConditionColor(item.condition);
             return (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-slate-500 text-center">{index + 1}</td>
                <td className="px-4 py-3 font-bold text-blue-600">{item.container}</td>
                <td className="px-4 py-3 text-slate-700">{item.shipName || "-"}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: condColor.bg, color: condColor.text }}>
                    {item.condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.side || "General"}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => cetakPdf(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 text-xs transition-colors"
                    >
                      <FileText size={14} /> DOC
                    </button>
                    <button 
                      onClick={() => cetakFoto(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 text-xs transition-colors"
                    >
                      <Image size={14} /> FOTO
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {history.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada riwayat transaksi inspeksi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
