// =========================================
// FILE:
// src/pages/office-dashboard/OfficeDashboard.jsx
// =========================================

import React, { useState, useEffect } from "react";
import UserManagement from "./UserManagement";
import API_URL from "../../config/api";
import SearchSelect, {
  ISO_CODES,
  CATEGORIES,
} from "../../components/SearchSelect";
import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import {
  Home,
  ClipboardList,
  FileText,
  PieChart as PieChartIcon,
  Users,
  Settings,
  LogOut,
  Eye,
  Bell,
  Search,
  Upload,
  Trash2,
  Pencil,
  Image,
  Download,
} from "lucide-react";

import "./OfficeDashboard.css";

const parsePhotos = (photoStr) => {
  if (!photoStr) return [];
  if (photoStr.includes("|")) return photoStr.split("|");
  if (photoStr.startsWith("data:image")) return [photoStr];
  return photoStr.split(",");
};

/* =========================================
   COMPONENT
========================================= */

const OfficeDashboard = ({
  user,
  onLogout,
  manifestData,
  setManifestData,
  onNavigate,
}) => {
const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const cetakPdf = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    const selectedSides = item.side ? item.side.split(",").map(s => s.trim()) : [];
    const sidesMap = [
      { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
      { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 24, y: 45 },
      { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 20, y: 70 },
      { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
      { val: "Roof/Atas", label: "Roof (Atas)", x: 83, y: 25 },
      { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 86, y: 42 },
      { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 74, y: 58 },
    ];


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

    win.document.write(`
<html>
<head>
<title>NPH ADIPURUSA - Container Inspection System - INSPECTION REPORT (CDR)</title>
<style>
* { box-sizing:border-box; }
@page { size:A4; margin:10mm; }
body { font-family:Arial,sans-serif; padding:12px; font-size:10px; color:#000; margin:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #004aad; padding-bottom:8px; margin-bottom:12px; }
.company { text-align:center; width:100%; }
.company h2 { margin:0; font-size:15px; font-weight:bold; color:#004aad; }
.company p { margin:1px 0; font-size:9px; }
.title { text-align:center; font-size:12px; font-weight:bold; margin-bottom:12px; text-decoration:underline; }
.info-table { width:100%; border-collapse:collapse; margin-bottom:15px; font-size:10px; }
.info-table td { padding:4px 0; vertical-align:top; }
.info-table td:first-child { width:120px; font-weight:bold; }
.info-table td:nth-child(2) { width:10px; text-align:center; }
.table-data { width:100%; border-collapse:collapse; margin-bottom:15px; font-size:9px; }
.table-data th, .table-data td { border:1px solid #000; padding:4px; text-align:left; }
.table-data th { background:#f0f0f0; font-weight:bold; text-align:center; }
.photo-title { font-weight:bold; margin-bottom:10px; font-size:10px; }
.photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; }
.photo-box { text-align:center; }
.photo-label { font-size:10px; font-weight:bold; margin-bottom:6px; }
.photo-box img { width:100%; height:165px; object-fit:contain; border-radius:8px; border:2px solid #004aad; }
.footer { display:flex; justify-content:space-between; margin-top:30px; font-size:10px; }
.ttd { text-align:center; width:150px; }
.ttd-line { margin-top:50px; border-top:1px solid #000; padding-top:4px; }
@media print { html,body { width:100%; height:auto; overflow:visible; } }

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
<div class="title">INSPECTION REPORT (CDR)</div>
<table class="info-table">
  <tr><td>Tanggal/Waktu</td><td>:</td><td>${dateFormatted}</td></tr>
  <tr><td>No Container</td><td>:</td><td>${item.container || "-"}</td></tr>
  <tr><td>Kapal/Voy</td><td>:</td><td>${item.shipName || "-"}</td></tr>
  <tr><td>ISO Code</td><td>:</td><td>${item.iso || "-"}</td></tr>
  <tr><td>Kategori</td><td>:</td><td>${item.category || "-"}</td></tr>
  <tr><td>Status</td><td>:</td><td>${item.status || "-"}</td></tr>
  <tr><td>Kondisi</td><td>:</td><td>${item.condition || "-"}</td></tr>
  <tr><td>Sisi</td><td>:</td><td>${item.side || "-"}</td></tr>
  <tr><td>Catatan</td><td>:</td><td>${item.note || "-"}</td></tr>
  <tr><td>Petugas Lapangan</td><td>:</td><td>${item.petugas || "-"}</td></tr>
</table>

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

<div class="photo-title">FOTO INSPEKSI</div>
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
<div class="footer">
  <div class="ttd"><div>Surveyor</div><div class="ttd-line">(${item.petugas || "................................"})</div></div>
  <div class="ttd"><div>Supervisor</div><div class="ttd-line">(................................)</div></div>
</div>
<script>
  window.onload = function() {
    var imgs = document.getElementsByTagName('img');
    if (imgs.length === 0) { window.print(); return; }
    var loaded = 0;
    function checkDone() { loaded++; if (loaded === imgs.length) window.print(); }
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].complete) { loaded++; }
      else { imgs[i].addEventListener('load', checkDone); imgs[i].addEventListener('error', checkDone); }
    }
    if (loaded === imgs.length) window.print();
  }
</script>
</body>
</html>
    `);
    win.document.close();
  };

  const cetakFoto = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    const selectedSides = item.side ? item.side.split(",").map(s => s.trim()) : [];
    const sidesMap = [
      { val: "Front/Depan", label: "Front (Depan)", x: 11, y: 45 },
      { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 24, y: 45 },
      { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 20, y: 70 },
      { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 45 },
      { val: "Roof/Atas", label: "Roof (Atas)", x: 83, y: 25 },
      { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 86, y: 42 },
      { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 74, y: 58 },
    ];


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

    win.document.write(`
<html>
<head>
<title>NPH ADIPURUSA - Container Inspection System - INSPECTION REPORT (CDR) - FOTO</title>
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
@media print { html,body { width:100%; height:auto; overflow:visible; } }

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
      if (imgs[i].complete) { loaded++; }
      else { imgs[i].addEventListener('load', checkDone); imgs[i].addEventListener('error', checkDone); }
    }
    if (loaded === imgs.length) window.print();
  }
</script>
</body>
</html>
    `);
    win.document.close();
  };

  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Theme & Extra layout menus state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("dashboard-theme") || "light";
  });
  const [showExtraStats, setShowExtraStats] = useState(() => {
    return localStorage.getItem("show-extra-stats") !== "false";
  });
  const [showQuickActions, setShowQuickActions] = useState(() => {
    return localStorage.getItem("show-quick-actions") !== "false";
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
  };

  useEffect(() => {
    localStorage.setItem("show-extra-stats", showExtraStats);
  }, [showExtraStats]);

  useEffect(() => {
    localStorage.setItem("show-quick-actions", showQuickActions);
  }, [showQuickActions]);

  const [selectedInspection, setSelectedInspection] = useState(null);

  // Edit states
  const [editingInspection, setEditingInspection] = useState(null);
  const [editContainer, setEditContainer] = useState("");
  const [editShipName, setEditShipName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editIso, setEditIso] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editSide, setEditSide] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editPetugas, setEditPetugas] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPhoto2, setEditPhoto2] = useState("");

  useEffect(() => {
    if (editingInspection) {
      setEditContainer(editingInspection.container || "");
      setEditShipName(editingInspection.shipName || "");
      setEditStatus(editingInspection.status || "");
      setEditIso(editingInspection.iso || "");
      setEditCategory(editingInspection.category || "");
      setEditCondition(
        editingInspection.condition
          ? editingInspection.condition.split(", ")
          : ["GOOD"]
      );
      setEditSide(
        editingInspection.side
          ? editingInspection.side.split(", ")
          : []
      );
      setEditNote(editingInspection.note || "");
      setEditPetugas(editingInspection.petugas || "");
      setEditGroup(editingInspection.group || "");

      // format date for datetime-local input (YYYY-MM-DDTHH:MM)
      if (editingInspection.date) {
        const d = new Date(editingInspection.date);
        const offset = d.getTimezoneOffset();
        const adjustedDate = new Date(d.getTime() - offset * 60 * 1000);
        setEditDate(adjustedDate.toISOString().slice(0, 16));
      } else {
        setEditDate("");
      }
    }
  }, [editingInspection]);

  const handleUpdateInspection = async (e) => {
    e.preventDefault();
    if (!editingInspection) return;

    if (!editContainer || !editCondition || editCondition.length === 0 || !editPetugas || !editDate) {
      alert(
        "Harap isi semua kolom wajib (Nomor Container, Kondisi, Petugas, Tanggal).",
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/inspection/${editingInspection.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            container: editContainer,
            shipName: editShipName,
            status: editStatus,
            iso: editIso ? editIso.split(' - ')[0] : '',
            category: editCategory,
            condition: Array.isArray(editCondition) ? editCondition.join(", ") : editCondition,
            side: Array.isArray(editSide) ? editSide.join(", ") : editSide,
            note: editNote,
            petugas: editPetugas,
            group: editGroup,
            date: editDate,
              photo2: editPhoto2,
          }),
        },
      );

      const result = await response.json();
      if (response.ok) {
        alert("Data inspeksi berhasil diperbarui.");

        // Update local historyData state
        const arr = Array.isArray(historyData) ? historyData : [];
        const updatedData = arr.map((item) => {
          if (item.id === editingInspection.id) {
            return {
              ...item,
              container: editContainer.trim().toUpperCase(),
              shipName: editShipName.trim(),
              status: editStatus,
              iso: editIso ? editIso.split(' - ')[0] : '',
              category: editCategory,
              condition: Array.isArray(editCondition) ? editCondition.join(", ") : editCondition,
              side: Array.isArray(editSide) ? editSide.join(", ") : editSide,
              note: editNote,
              petugas: editPetugas,
              group: editGroup,
              date: editDate,
            };
          }
          return item;
        });

        setHistoryData(updatedData);
        localStorage.setItem("history", JSON.stringify(updatedData));
        window.dispatchEvent(new Event("storage"));
        setEditingInspection(null); // Close modal
      } else {
        alert("Gagal memperbarui data: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Gagal terhubung ke server untuk memperbarui.");
    }
  };

  const handleDeleteInspection = async (id) => {
    if (!(user?.username === "adminRAL" || user?.role !== "PETUGAS")) {
      alert("Hanya admin dan supervisi yang dapat menghapus data.");
      return;
    }
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus data inspeksi ini secara permanen?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/inspection/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        alert("Data inspeksi berhasil dihapus.");
        // Immediate local state refresh
        const arr = Array.isArray(historyData) ? historyData : [];
        const updatedData = arr.filter((item) => item.id !== id);
        setHistoryData(updatedData);
        localStorage.setItem("history", JSON.stringify(updatedData));
        // Notify other windows/components
        window.dispatchEvent(new Event("storage"));
      } else {
        alert("Gagal menghapus: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal terhubung ke server untuk menghapus.");
    }
  };

  const formatInspectionDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let str = d.toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      str = str
        .replace(/\bpukul\b/i, "")
        .replace(/\s+/g, " ")
        .trim();
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (str.startsWith(day) && !str.startsWith(day + ",")) {
          str = str.replace(day, day + ",");
          break;
        }
      }
      return `${str} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionDatePDF = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (datePart.startsWith(day) && !datePart.startsWith(day + ",")) {
          datePart = datePart.replace(day, day + ",");
          break;
        }
      }
      const timePart = d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(":", ".");
      return `${datePart}<br/>${timePart} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionDatePart = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (datePart.startsWith(day) && !datePart.startsWith(day + ",")) {
          datePart = datePart.replace(day, day + ",");
          break;
        }
      }
      return datePart;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionTimePart = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const timePart = d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(":", ".");
      return `${timePart} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const [historyData, setHistoryData] = React.useState(() => {
    try {
      const val = localStorage.getItem("history");
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Auto-refresh riwayat inspeksi saat database berubah atau berkala (real-time sync)
  useEffect(() => {
    const refreshHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/inspection?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
          }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistoryData(data);
          localStorage.setItem("history", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load inspections from database:", err);
        const raw = localStorage.getItem("history");
        let latest = [];
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) latest = parsed;
        } catch (e) {}
        setHistoryData(latest);
      }
    };

    refreshHistory();

    window.addEventListener("storage", refreshHistory);
    document.addEventListener("visibilitychange", refreshHistory);
    window.addEventListener("focus", refreshHistory);

    // Refresh berkala setiap 5 detik agar dashboard ter-update otomatis secara real-time
    const interval = setInterval(refreshHistory, 5000);

    return () => {
      window.removeEventListener("storage", refreshHistory);
      document.removeEventListener("visibilitychange", refreshHistory);
      window.removeEventListener("focus", refreshHistory);
      clearInterval(interval);
    };
  }, []);

  const [showAdminPanel, setShowAdminPanel] = React.useState(false);

  const [managerName, setManagerName] = React.useState("Rian Agung");

  const [supervisorName, setSupervisorName] = React.useState("Budi Santoso");

  const [assistantName, setAssistantName] = React.useState("Andi Wijaya");

  const [petugasName, setPetugasName] = React.useState("Petugas Lapangan");

  /* ACCOUNT SYSTEM */

  const [accounts, setAccounts] = React.useState(() => {
    const defaultAccounts = [
      {
        username: "manager",
        password: "123",
        jabatan: "MANAGER",
      },
      {
        username: "supervisor",
        password: "123",
        jabatan: "SUPERVISOR",
      },
      {
        username: "assistant",
        password: "123",
        jabatan: "ASSISTANT SUPERVISOR",
      },
      {
        username: "petugas",
        password: "123",
        jabatan: "PETUGAS",
      },
    ];
    try {
      const val = localStorage.getItem("accounts");
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return defaultAccounts;
  });

  const addUser = () => {
    if (!newUsername || !newPassword) {
      alert("Lengkapi data");
      return;
    }

    const newUser = {
      username: newUsername,
      password: newPassword,
      jabatan: newJabatan,
      active: true,
    };

    const updated = [...accounts, newUser];

    setAccounts(updated);

    localStorage.setItem("accounts", JSON.stringify(updated));

    setNewUsername("");
    setNewPassword("");

    alert("User berhasil dibuat");
  };

  const deleteUser = (index) => {
    const arr = Array.isArray(accounts) ? accounts : [];
    const updated = arr.filter((_, i) => i !== index);

    setAccounts(updated);

    localStorage.setItem("accounts", JSON.stringify(updated));
  };

  const [newUsername, setNewUsername] = React.useState("");

  const [newPassword, setNewPassword] = React.useState("");

  const [newJabatan, setNewJabatan] = React.useState("PETUGAS");

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = search.trim().toUpperCase();
      if (!query) return;

      const arr = Array.isArray(historyData) ? historyData : [];
      let found = arr.find(
        (item) =>
          item &&
          item.container &&
          item.container.toUpperCase().trim() === query,
      );

      if (!found) {
        found = arr.find(
          (item) =>
            item &&
            item.container &&
            item.container.toUpperCase().includes(query),
        );
      }

      if (found) {
        setSelectedInspection(found);
      } else {
        const manifestArr = Array.isArray(manifestData) ? manifestData : [];
        const foundInManifest = manifestArr.find((item) => {
          const num = String(item.container || item.CONTAINER || "")
            .toUpperCase()
            .trim();
          return num === query || num.includes(query);
        });

        if (foundInManifest) {
          alert(
            `Kontainer "${query}" ditemukan di manifest kapal (${foundInManifest.shipName || "Tanpa Kapal"}), status: ${foundInManifest.status || "EMPTY"}, tetapi belum pernah diinspeksi oleh petugas.`,
          );
        } else {
          alert(
            `Kontainer "${query}" tidak ditemukan di riwayat inspeksi maupun manifest.`,
          );
        }
      }
    }
  };

  const arrHistory = Array.isArray(historyData) ? historyData : [];
  const arrManifest = Array.isArray(manifestData) ? manifestData : [];

  const totalInspeksi = arrHistory.length;
  const totalDamage = arrHistory.filter(
    (item) => item.condition && item.condition.toUpperCase() !== "GOOD",
  ).length;
  const totalGood = arrHistory.filter(
    (item) => item.condition && item.condition.toUpperCase() === "GOOD",
  ).length;
  const damagePercentage =
    totalInspeksi > 0
      ? ((totalDamage / totalInspeksi) * 100).toFixed(1) + "%"
      : "0%";
  const goodPercentage =
    totalInspeksi > 0
      ? ((totalGood / totalInspeksi) * 100).toFixed(1) + "%"
      : "0%";
  const petugasAktif =
    new Set(arrHistory.map((item) => item.petugas).filter(Boolean)).size || 0;

  const containerFull =
    arrManifest.filter(
      (item) => item.status && item.status.toUpperCase().includes("FULL"),
    ).length ||
    arrHistory.filter(
      (item) => item.status && item.status.toUpperCase().includes("FULL"),
    ).length ||
    0;
  const containerEmpty =
    arrManifest.filter(
      (item) =>
        item.status &&
        (item.status.toUpperCase().includes("EMPTY") ||
          item.status.toUpperCase().includes("MT")),
    ).length ||
    arrHistory.filter(
      (item) =>
        item.status &&
        (item.status.toUpperCase().includes("EMPTY") ||
          item.status.toUpperCase().includes("MT")),
    ).length ||
    0;
  const waitingRepair = totalDamage;

  const getInspectionsToday = () => {
    const today = new Date().toDateString();
    return arrHistory.filter((item) => {
      if (!item.date) return false;
      return new Date(item.date).toDateString() === today;
    }).length;
  };
  const inspectionsToday = getInspectionsToday();

  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        {/* TOGGLE BUTTON */}
        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        {/* LOGO */}
        <div className="logo-section">
          <img src="/logo.jpg" alt="Logo" className="logo-box" style={{ width: "40px", height: "40px", background: "transparent", border: "none", objectFit: "contain" }} />

          {sidebarOpen && (
            <div>
              <h1 className="logo-title">NPH</h1>
              <p className="logo-subtitle">ADIPURUSA</p>
            </div>
          )}
        </div>

        {/* MENU */}
        <div className="menu-list">
          {/* MENU */}
          <div className="menu-list">
            {/* DASHBOARD */}
            <button
              className={`menu-item ${
                activeMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu("dashboard");
                if (window.innerWidth <= 900) setSidebarOpen(false);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              <Home className="menu-icon" size={20} />

              {sidebarOpen && <span>Dashboard</span>}
            </button>

            {/* DATA INSPEKSI */}
            <button
              className={`menu-item ${
                activeMenu === "inspeksi" ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu("inspeksi");
                if (window.innerWidth <= 900) setSidebarOpen(false);

                document.getElementById("table-inspeksi")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <ClipboardList className="menu-icon" size={20} />

              {sidebarOpen && <span>Data Inspeksi</span>}
            </button>

            {/* USER */}
            {user?.username === "adminRAL" && (
              <button
                className={`menu-item ${activeMenu === "user" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("user");
                  if (window.innerWidth <= 900) setSidebarOpen(false);
                  setShowAdminPanel(true);
                  setTimeout(() => {
                    document.getElementById("user-section")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }}
              >
                <Users className="menu-icon" size={20} />
                {sidebarOpen && <span>User</span>}
              </button>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div
          className="logout-section"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <button
            className="logout-btn back-btn"
            onClick={() => onNavigate("dashboard")}
          >
            <Home className="menu-icon" size={20} />
            {sidebarOpen && <span>Menu Utama</span>}
          </button>

          <button className="logout-btn" onClick={onLogout}>
            <LogOut className="menu-icon" size={20} />

            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* HEADER */}
        <div className="top-header">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              <button
                className="mobile-toggle-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <h2 className="page-title" style={{ margin: 0 }}>
                Dashboard Kantor
              </h2>
            </div>

            {/* ROLE */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {user?.role}
              </div>

              <div
                style={{
                  background: "#22c55e",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Shift {user?.shift}
              </div>

              {user?.group && (
                <div
                  style={{
                    background: "#8b5cf6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  Group: {user?.group}
                </div>
              )}
            </div>

            {/* USER */}
            <h3
              style={{
                marginTop: 16,
                color: "#0f172a",
                fontSize: 22,
              }}
            >
              Selamat Datang, {user?.nama}
            </h3>

            <p className="page-subtitle">
              Sistem Monitoring Inspeksi Kontainer
            </p>
          </div>

          {/* ACTION */}
          <div className="header-actions">
            {user?.username === "adminRAL" && (
              <button
                className="notif-btn"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                <Settings size={20} />
              </button>
            )}

            {/* SEARCH */}

            <div className="search-box">
              <Search size={20} className="search-icon" />

              <input
                type="text"
                placeholder="Cari nomor container & tekan Enter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="search-input"
              />
            </div>

            {/* NOTIF */}
            <button className="notif-btn">
              <Bell size={20} />
            </button>
          </div>
        </div>

        {activeMenu === "dashboard" && (
          <div className="dashboard-summary" style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <StatCard title="Total Inspeksi" value={totalInspeksi} color="blue" />
            <StatCard title="Total Damage" value={totalDamage} color="orange" />
          </div>
        )}

        {activeMenu === "user" && showAdminPanel && user?.username === "adminRAL" && (
          <div id="user-section">
            <UserManagement />
          </div>
        )}

        {/* RIWAYAT INSPEKSI */}
        {activeMenu === "inspeksi" && (() => {
          // Pre-compute filtered data for KPIs and Export
          const filtered = (
            Array.isArray(historyData) ? historyData : []
          ).filter((item) => {
            let match = true;
            if (search.trim()) {
              const q = search.toLowerCase().trim();
              match = (
                (item.container || "").toLowerCase().includes(q) ||
                (item.shipName || "").toLowerCase().includes(q) ||
                (item.petugas || "").toLowerCase().includes(q) ||
                (item.group || "").toLowerCase().includes(q) ||
                (item.condition || "").toLowerCase().includes(q) ||
                (item.side || "").toLowerCase().includes(q)
              );
            }
            if (match && (filterStartDate || filterEndDate)) {
              if (!item.date) return false;
              const itemDate = new Date(item.date);
              if (filterStartDate) {
                const start = new Date(filterStartDate);
                start.setHours(0, 0, 0, 0);
                if (itemDate < start) match = false;
              }
              if (match && filterEndDate) {
                const end = new Date(filterEndDate);
                end.setHours(23, 59, 59, 999);
                if (itemDate > end) match = false;
              }
            }
            return match;
          });

          const totalFiltered = filtered.length;
          const totalGood = filtered.filter(i => i.condition === "GOOD").length;
          const totalDamage = totalFiltered - totalGood;
          const totalPages = Math.ceil(totalFiltered / 10);
          const paginated = filtered.slice((currentPage - 1) * 10, currentPage * 10);

          const handleExportCSV = () => {
            if (filtered.length === 0) {
              alert("Tidak ada data untuk diekspor.");
              return;
            }
            const headers = ["No", "Tanggal", "Container", "Kapal/Voy", "ISO", "Kategori", "Status", "Kondisi", "Sisi", "Catatan", "Petugas", "Grup"];
            const rows = filtered.map((item, index) => [
              index + 1,
              item.date ? new Date(item.date).toLocaleString("id-ID").replace(/,/g, "") : "-",
              item.container || "",
              item.shipName || "",
              item.iso || "",
              item.category || "",
              item.status || "",
              item.condition || "",
              item.side || "",
              (item.note || "").replace(/\n/g, " ").replace(/,/g, ";"),
              item.petugas || "",
              item.group || ""
            ]);
            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Export_Inspeksi_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          return (
            <div style={{ marginTop: "24px" }}>
              {/* KPI Cards for Filtered Data */}
              <div className="dashboard-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                <StatCard title="Total Hasil Filter" value={totalFiltered} color="blue" />
                <StatCard title="Kondisi Good" value={totalGood} color="green" />
                <StatCard title="Kondisi Damage" value={totalDamage} color="red" />
              </div>

              {/* Advanced Filter Bar */}
              <div className="table-card" style={{ marginBottom: "20px", padding: "15px", display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end", background: "#f8fafc" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "200px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "5px" }}>Mulai Tanggal</label>
                  <input type="date" className="search-input" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "200px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "5px" }}>Sampai Tanggal</label>
                  <input type="date" className="search-input" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <button onClick={handleExportCSV} style={{ background: "#10b981", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", height: "42px" }}>
                    <Download size={18} /> Export Excel (CSV)
                  </button>
                </div>
              </div>

        <div
          id="table-inspeksi"
          className="table-card"
        >
          <div className="table-header">
            <h3>Tabel Transaksi Inspeksi</h3>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>

                  <th>Tanggal</th>

                  <th>Container</th>

                  <th>Petugas</th>

                  <th>Grup</th>

                  <th>Kondisi</th>

                  <th>Sisi</th>

                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((item, index) => {
                  const absoluteIndex = (currentPage - 1) * 10 + index + 1;
                    return (
                      <tr key={index}>
                        <td>{absoluteIndex}</td>

                        <td>{formatInspectionDate(item.date)}</td>

                        <td>{item.container}</td>

                        <td>{item.petugas || "Petugas Lapangan"}</td>

                        <td>{item.group || "Lapangan"}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              item.condition === "GOOD" ? "good" : "damage"
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>

                        <td>{item.side}</td>

                        <td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", whiteSpace: "nowrap" }}>
                            <button
                              className="detail-btn"
                              onClick={() => setSelectedInspection(item)}
                              title="Lihat Detail Inspeksi"
                            >
                              <Eye size={18} />
                            </button>
                            
                            <button
                              className="detail-btn"
                              onClick={() => cetakPdf(item)}
                              title="Cetak Dokumen"
                            >
                              <FileText size={18} />
                            </button>

                            <button
                              className="detail-btn"
                              onClick={() => cetakFoto(item)}
                              title="Cetak Foto"
                            >
                              <Image size={18} />
                            </button>

                            {(user?.username === "adminRAL" || user?.role !== "PETUGAS") && (
                              <button
                                className="edit-btn"
                                onClick={() => setEditingInspection(item)}
                                title="Edit Inspeksi"
                              >
                                <Pencil size={18} />
                              </button>
                            )}

                            {(user?.username === "adminRAL" || user?.role !== "PETUGAS") && (
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteInspection(item.id)}
                                title="Hapus Inspeksi"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {(() => {
            if (totalPages > 1) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "15px",
                    paddingBottom: "15px",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      background: currentPage === 1 ? "#f5f5f5" : "#fff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    &lt; Sebelumnya
                  </button>
                  <span style={{ padding: "8px 12px", fontWeight: "bold" }}>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      background:
                        currentPage === totalPages ? "#f5f5f5" : "#fff",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Selanjutnya &gt;
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
        </div>
          );
        })()}

        {/* PENGATURAN / SETTINGS SECTION */}
        {activeMenu === "settings" && (
        <div
          id="settings-section"
          className="um-card"
          style={{
            marginTop: "24px",
          }}
        >
          <div className="card-header-um">
            <Settings size={20} className="icon-blue" />
            <h4>Pengaturan Aplikasi</h4>
          </div>

          <div
            className="settings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "10px",
            }}
          >
            {/* TEMA WARNA */}
            <div
              className="settings-option-group"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h5
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Tema Warna Dashboard
              </h5>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Pilih tema warna visual untuk antarmuka Admin Control Panel
                Anda.
              </p>

              <div
                className="theme-selectors"
                style={{ display: "flex", gap: "10px", marginTop: "6px" }}
              >
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`theme-select-btn ${theme === "light" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      theme === "light"
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                    }}
                  ></div>
                  <span style={{ color: "#334155" }}>Light Slate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`theme-select-btn ${theme === "dark" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      theme === "dark"
                        ? "2px solid #38bdf8"
                        : "1px solid #cbd5e1",
                    background: "#1e293b",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#0f172a",
                      border: "1px solid #334155",
                    }}
                  ></div>
                  <span
                    style={{ color: theme === "dark" ? "white" : "#334155" }}
                  >
                    Dark Slate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange("orange")}
                  className={`theme-select-btn ${theme === "orange" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      theme === "orange"
                        ? "2px solid #ea580c"
                        : "1px solid #cbd5e1",
                    background: "#0c0a09",
                    color: "#f2f2f2",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ea580c",
                      border: "1px solid #444",
                    }}
                  ></div>
                  <span
                    style={{ color: theme === "orange" ? "white" : "#334155" }}
                  >
                    Cyber Orange
                  </span>
                </button>
              </div>
            </div>

            {/* OPSI MENU TAMBAHAN */}
            <div
              className="settings-option-group"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h5
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Menu & Fitur Tambahan
              </h5>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Aktifkan atau sembunyikan modul visual tambahan pada panel
                kontrol admin.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "6px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showExtraStats}
                    onChange={(e) => setShowExtraStats(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ color: "#334155" }}>
                    Tampilkan Modul Statistik Grafik Tambahan
                  </span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                    color: "#334155",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showQuickActions}
                    onChange={(e) => setShowQuickActions(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ color: "#334155" }}>
                    Tampilkan Tombol Akses Pintar (Quick Actions)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedInspection && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedInspection(null)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">
                Detail Inspeksi: {selectedInspection.container}
              </h4>
              <button
                className="btn-close-modal"
                onClick={() => setSelectedInspection(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Kondisi</div>
                  <div className="info-val">
                    {selectedInspection.condition || "-"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Sisi Kerusakan</div>
                  <div className="info-val">
                    {selectedInspection.side || "-"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Petugas Pemeriksa</div>
                  <div className="info-val">
                    {selectedInspection.petugas || "Petugas Lapangan"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Grup Petugas</div>
                  <div className="info-val">
                    {selectedInspection.group || "Lapangan"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Waktu Inspeksi</div>
                  <div className="info-val">
                    {formatInspectionDate(selectedInspection.date)}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">ISO / Status</div>
                  <div className="info-val">
                    {selectedInspection.iso || "-"} /{" "}
                    {selectedInspection.status || "-"}
                  </div>
                </div>
              </div>

              {selectedInspection.note && (
                <div className="notes-section">
                  <h5>Catatan Kronologi</h5>
                  <div className="notes-box">{selectedInspection.note}</div>
                </div>
              )}

              <div className="photos-section">
                <h5>Foto Dokumentasi</h5>
                <div className="photos-grid-modal">
                  <div className="photo-card">
                    <span>FOTO NOMOR CONTAINER</span>
                    {selectedInspection.photo2 ? (
                      <img
                        src={selectedInspection.photo2}
                        alt="Foto Nomor Container"
                      />
                    ) : (
                      <div className="no-photo-text">Tidak ada foto</div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "15px",
                    }}
                  >
                    {parsePhotos(selectedInspection.photo1)
                      .map((url) => url.trim())
                      .filter(Boolean)
                      .map((url, idx) => (
                        <div className="photo-card" key={idx}>
                          <span>FOTO DETAIL KERUSAKAN {idx + 1}</span>
                          <img src={url} alt={`Foto Kerusakan ${idx + 1}`} />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingInspection && (
        <div
          className="modal-overlay"
          onClick={() => setEditingInspection(null)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "650px" }}
          >
            <div className="modal-header">
              <h4 className="modal-title">
                Edit Inspeksi: {editingInspection.container}
              </h4>
              <button
                className="btn-close-modal"
                onClick={() => setEditingInspection(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateInspection} className="modal-body">
              <div
                className="edit-form-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    No. Container <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editContainer}
                    onChange={(e) => setEditContainer(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Nama Kapal
                  </label>
                  <input
                    type="text"
                    value={editShipName}
                    onChange={(e) => setEditShipName(e.target.value)}
                    placeholder="Contoh: KM Kelud"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    ISO
                  </label>
                  <SearchSelect
                    value={editIso}
                    onChange={(val) => setEditIso(val)}
                    options={ISO_CODES}
                    placeholder="-ISO Code-"
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Category
                  </label>
                  <SearchSelect
                    value={editCategory}
                    onChange={(val) => setEditCategory(val)}
                    options={CATEGORIES}
                    placeholder="DRY"
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Status (FULL/EMPTY)
                  </label>
                  <input
                    type="text"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    placeholder="Contoh: FULL, EMPTY, MT"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Kondisi <span style={{ color: "red" }}>*</span>
                  </label>
                  <MultiSelectDropdown
                    options={[
                      "GOOD",
                      "Bent/Bengkok",
                      "Broken/Pecah",
                      "Bulging/Menggelembung",
                      "Crushed/Ringsek",
                      "Cut/Terpotong",
                      "Dented/Penyok",
                      "Hole/Berlubang",
                      "Leaking/Bocor",
                      "Missing/Hilang",
                      "Scraped/Tergores",
                      "Torn/Robek",
                    ]}
                    value={Array.isArray(editCondition) ? editCondition : [editCondition].filter(Boolean)}
                    onChange={(newVal) => {
                      if (newVal.length > 4) {
                        alert("Maksimal 4 opsi yang dapat dipilih.");
                        return;
                      }
                      setEditCondition(newVal);
                    }}
                    placeholder="-Kondisi-"
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Sisi Kerusakan
                  </label>
                  <MultiSelectDropdown
                    options={[
                      "Front/Depan",
                      "Bottom/Bawah",
                      "Left Side/Sisi Kiri",
                      "Right Side/Sisi Kanan",
                      "Roof/Atas",
                      "Rear/Belakang",
                      "Inside/Dalam"
                    ]}
                    value={Array.isArray(editSide) ? editSide : [editSide].filter(Boolean)}
                    onChange={(newVal) => {
                      if (newVal.length > 4) {
                        alert("Maksimal 4 opsi yang dapat dipilih.");
                        return;
                      }
                      setEditSide(newVal);
                    }}
                    placeholder="-Sisi-"
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Petugas Pemeriksa <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editPetugas}
                    onChange={(e) => setEditPetugas(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Grup Petugas
                  </label>
                  <input
                    type="text"
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gridColumn: "span 2",
                  }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Tanggal Inspeksi <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  className="form-group-edit"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gridColumn: "span 2",
                  }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    Catatan Kronologi
                  </label>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows="3"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingInspection(null)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#16a34a",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================
   CARD
========================================= */

function StatCard({ title, value, subtitle, color }) {
  const icons = {
    blue: "📦",
    orange: "⚠️",
    green: "✅",
    purple: "👨‍💼",
  };

  return (
    <div className={`stat-card ${color}`}>
      <div
        style={{
          fontSize: "28px",
          marginBottom: "10px",
        }}
      >
        {icons[color]}
      </div>

      <p>{title}</p>

      <h2>{value}</h2>

      {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
    </div>
  );
}

/* =========================================
   TABLE ROW
========================================= */

function TableRow({
  no,
  tanggal,
  container,

  petugas,
  kondisi,
  sisi,
}) {
  return (
    <tr>
      <td>{no}</td>

      <td>{tanggal}</td>

      <td>{container}</td>

      <td>{petugas}</td>

      <td>
        <span
          className={`status-badge ${kondisi === "Good" ? "good" : "damage"}`}
        >
          {kondisi}
        </span>
      </td>

      <td>{sisi}</td>

      <td>
        <button className="detail-btn">
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}
const thStyle = {
  border: "1px solid #cbd5e1",
  padding: "12px",
  background: "#f1f5f9",
};

const tdStyle = {
  border: "1px solid #cbd5e1",
  padding: "12px",
};

export default OfficeDashboard;
