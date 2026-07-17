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
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Server,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

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

.diagram-container { position:relative; width:100%; max-width:500px; height:350px; margin:20px auto; border:2px solid #cbd5e1; border-radius:16px; overflow:hidden; background:white; }
.diagram-image { width:100%; height:100%; display:block; object-fit: fill; filter: brightness(1.2) contrast(1.2); }
.diagram-hotspot { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; }
.hotspot-badge { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:rgba(239,68,68,0.95); color:white; border:2px solid white; font-size:12px; font-weight:bold; }
.hotspot-badge.checked { background:rgba(34,197,94,0.95); }
.hotspot-label { background:rgba(15,23,42,1); color:white; font-size:10px; font-weight:bold; padding:3px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; }
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

.diagram-container { position:relative; width:100%; max-width:500px; height:350px; margin:20px auto; border:2px solid #cbd5e1; border-radius:16px; overflow:hidden; background:white; }
.diagram-image { width:100%; height:100%; display:block; object-fit: fill; filter: brightness(1.2) contrast(1.2); }
.diagram-hotspot { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; }
.hotspot-badge { display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:rgba(239,68,68,0.95); color:white; border:2px solid white; font-size:12px; font-weight:bold; }
.hotspot-badge.checked { background:rgba(34,197,94,0.95); }
.hotspot-label { background:rgba(15,23,42,1); color:white; font-size:10px; font-weight:bold; padding:3px 6px; border-radius:4px; margin-top:2px; white-space:nowrap; }
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
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securityStats, setSecurityStats] = useState({ failedLogins: 0, blockedUploads: 0, blockedApis: 0 });
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setEditDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setEditDate("");
      }
    }
  }, [editingInspection]);

  const fetchSecurityData = async () => {
    setIsLoadingSecurity(true);
    try {
      const statsRes = await fetch(`${API_URL}/api/security/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setSecurityStats(statsData.data);
      }
      
      const logsRes = await fetch(`${API_URL}/api/security/logs`);
      const logsData = await logsRes.json();
      if (logsData.success) {
        setSecurityLogs(logsData.data);
      }
    } catch (err) {
      console.error("Failed to fetch security data:", err);
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const handleClearSecurityLogs = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus seluruh log keamanan? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/security/clear`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Log keamanan berhasil dibersihkan!");
        fetchSecurityData();
      } else {
        alert(data.error || "Gagal membersihkan log");
      }
    } catch (err) {
      console.error("Error clearing logs:", err);
      alert("Error membersihkan log");
    }
  };

  useEffect(() => {
    if (activeMenu === "security") {
      fetchSecurityData();
    }
  }, [activeMenu]);

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
        timeZone: "Asia/Jakarta",
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
        timeZone: "Asia/Jakarta",
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
          timeZone: "Asia/Jakarta",
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
        timeZone: "Asia/Jakarta",
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
  const [isDataLoading, setIsDataLoading] = useState(true);

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
      } finally {
        setIsDataLoading(false);
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

            {/* SECURITY & SYSTEM MONITORING */}
            {user?.username === "adminRAL" && (
              <button
                className={`menu-item ${activeMenu === "security" ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu("security");
                  if (window.innerWidth <= 900) setSidebarOpen(false);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                <ShieldAlert className="menu-icon" size={20} />
                {sidebarOpen && <span>Keamanan & Sistem</span>}
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
                  background: "#3da5c4",
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
                  background: "#fdb95e",
                  color: "#0f172a",
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
                    background: "#F05A28",
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

            {/* USER WELCOME BANNER */}
            <div className="welcome-banner">
              <div className="welcome-content">
                <h3>Selamat Datang, {user?.nama}</h3>
                <p>Sistem Monitoring Inspeksi Kontainer — Nusantara Pelabuhan Handal</p>
              </div>
              <div className="welcome-date">
                <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
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
            <div style={{ position: "relative" }}>
              <button 
                className="notif-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: "relative" }}
              >
                <Bell size={20} />
                {(() => {
                   const damages = arrHistory.filter(i => i.condition && i.condition !== "GOOD");
                   // Just check if there's any recent damage today for the badge
                   const today = new Date().toDateString();
                   const hasRecent = damages.some(i => i.date && new Date(i.date).toDateString() === today);
                   if (hasRecent) {
                     return <div style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }}></div>;
                   }
                   return null;
                })()}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    Notifikasi Kerusakan
                  </div>
                  <div className="notification-list">
                    {(() => {
                      const damages = arrHistory
                        .filter(i => i.condition && i.condition !== "GOOD")
                        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                        .slice(0, 5); // top 5
                      
                      if (damages.length === 0) {
                        return <div className="notif-empty">Tidak ada notifikasi kerusakan terbaru.</div>;
                      }

                      return damages.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="notification-item"
                          onClick={() => {
                            setSelectedInspection(item);
                            setShowNotifications(false);
                          }}
                        >
                          <span className="notif-title">{item.container || "Unknown Container"}</span>
                          <span className="notif-desc">{item.condition} ({item.side})</span>
                          <span className="notif-time">{item.date ? new Date(item.date).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeMenu === "dashboard" && (() => {
          // Chart Data Logic
          const barMap = {};
          const pieMap = {};
          
          (Array.isArray(historyData) ? historyData : []).forEach(item => {
            if (item.date) {
              const dateObj = new Date(item.date);
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const key = `${year}-${month}`;
              if (!barMap[key]) barMap[key] = 0;
              barMap[key]++;
            }
            
            // Collect Damage Types (Jenis Kerusakan)
            let conditions = [];
            if (Array.isArray(item.condition)) {
              conditions = item.condition;
            } else if (typeof item.condition === "string") {
              try {
                 const parsed = JSON.parse(item.condition);
                 if (Array.isArray(parsed)) conditions = parsed;
                 else conditions = item.condition.split(",").map(c => c.trim());
              } catch(e) {
                 conditions = item.condition.split(",").map(c => c.trim());
              }
            }
            
            conditions.forEach(cond => {
              if (cond && cond.toUpperCase() !== "GOOD" && cond.toUpperCase() !== "DAMAGE") {
                let normal = cond;
                const lower = cond.toLowerCase();
                if (lower.includes("dent") || lower.includes("penyok")) normal = "Dented/Penyok";
                else if (lower.includes("bent") || lower.includes("bengkok")) normal = "Bent/Bengkok";
                else if (lower.includes("broken") || lower.includes("pecah")) normal = "Broken/Pecah";
                else if (lower.includes("bulg") || lower.includes("menggelembung")) normal = "Bulging/Menggelembung";
                else if (lower.includes("crush") || lower.includes("ringsek")) normal = "Crushed/Ringsek";
                else if (lower.includes("cut") || lower.includes("terpotong")) normal = "Cut/Terpotong";
                else if (lower.includes("hole") || lower.includes("berlubang")) normal = "Hole/Berlubang";
                else if (lower.includes("leak") || lower.includes("bocor")) normal = "Leaking/Bocor";
                else if (lower.includes("miss") || lower.includes("hilang")) normal = "Missing/Hilang";
                else if (lower.includes("scrap") || lower.includes("tergores")) normal = "Scraped/Tergores";
                else if (lower.includes("torn") || lower.includes("robek")) normal = "Torn/Robek";
                else if (lower.includes("rust") || lower.includes("karat")) normal = "Rust/Karat";

                if (!pieMap[normal]) pieMap[normal] = 0;
                pieMap[normal]++;
              }
            });
          });

          const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const sortedKeys = Object.keys(barMap).sort();
          const barData = sortedKeys.map(k => {
            const [year, month] = k.split("-");
            const monthIdx = parseInt(month, 10) - 1;
            const name = months[monthIdx];
            return { name, total: barMap[k] };
          }).slice(-7);
          
          const modernColors = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4", "#14b8a6"];
          const pieData = Object.keys(pieMap).map((k, i) => ({
            name: k,
            value: pieMap[k],
            color: modernColors[i % modernColors.length]
          })).sort((a,b) => b.value - a.value);

          return (
            <div style={{ marginTop: "24px" }}>
              <div className="dashboard-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <StatCard title="Total Inspeksi" value={totalInspeksi} color="blue" />
                <StatCard title="Total Damage" value={totalDamage} color="orange" />
              </div>

              <div className="chart-grid" style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <div className="chart-card" style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ marginBottom: "16px", fontSize: "18px", color: "#0f172a" }}>Tren Inspeksi Bulanan</h3>
                  {isDataLoading ? (
                    <div className="skeleton-chart"></div>
                  ) : (
                    <div className="real-chart" style={{ height: "250px", width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3da5c4" stopOpacity={0.95}/>
                              <stop offset="95%" stopColor="#F05A28" stopOpacity={0.95}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{fill: '#f1f5f9'}} 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }} 
                          />
                          <Bar dataKey="total" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="chart-card" style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ marginBottom: "16px", fontSize: "18px", color: "#0f172a" }}>Distribusi Jenis Kerusakan</h3>
                  {isDataLoading ? (
                    <div className="skeleton-chart"></div>
                  ) : (
                    <div className="real-chart" style={{ height: "250px", width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "28px", fontWeight: "bold", fill: "#0f172a" }}>
                            {totalInspeksi}
                          </text>
                          <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "13px", fill: "#64748b", fontWeight: "500" }}>
                            Total
                          </text>
                          <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "12px", fill: "#94a3b8" }}>
                            Terinspeksi
                          </text>
                          <Pie 
                            data={pieData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={70}
                            outerRadius={90} 
                            paddingAngle={5}
                            labelLine={false}
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {activeMenu === "user" && showAdminPanel && user?.username === "adminRAL" && (
          <div id="user-section">
            <UserManagement />
          </div>
        )}

        {activeMenu === "security" && user?.username === "adminRAL" && (
          <div id="security-section" style={{ padding: "20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Security &amp; System Monitoring
                </h2>
                <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
                  Pantau kondisi kesehatan server backend, deteksi potensi ancaman, dan log audit keamanan.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={fetchSecurityData}
                  disabled={isLoadingSecurity}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#475569",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.2s"
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button 
                  onClick={handleClearSecurityLogs}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                    transition: "all 0.2s"
                  }}
                >
                  Hapus Log
                </button>
              </div>
            </div>

            {/* Health Status Dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "12px", borderRadius: "12px" }}>
                  <Server size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Database MySQL</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }}></span>
                    TERKONEKSI
                  </div>
                </div>
              </div>

              <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "12px", borderRadius: "12px" }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>SSL HTTPS</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }}></span>
                    AKTIF (AMAN)
                  </div>
                </div>
              </div>

              <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px", borderRadius: "12px" }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Percobaan Retas</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                    {securityStats.failedLogins + securityStats.blockedUploads + securityStats.blockedApis}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              {/* Card 1 */}
              <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "4px solid #f97316" }}>
                <h4 style={{ color: "#475569", fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>Login Gagal (Bcrypt Mismatch)</h4>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>{securityStats.failedLogins}</div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0 0" }}>Upaya login dengan password salah atau user tidak terdaftar.</p>
              </div>

              {/* Card 2 */}
              <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "4px solid #ef4444" }}>
                <h4 style={{ color: "#475569", fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>Upload Berbahaya Dicegah</h4>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>{securityStats.blockedUploads}</div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0 0" }}>Upload file non-gambar (potensi RCE/exploit) yang berhasil diblokir.</p>
              </div>

              {/* Card 3 */}
              <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "4px solid #3b82f6" }}>
                <h4 style={{ color: "#475569", fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>Akses API Ilegal Diblokir</h4>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>{securityStats.blockedApis}</div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0 0" }}>Request API backend tanpa token atau token kadaluwarsa yang dicegah.</p>
              </div>
            </div>

            {/* Live Logs Table */}
            <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Live Security Log Audit (Terbaru)</h3>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th style={{ padding: "12px 16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>Waktu</th>
                      <th style={{ padding: "12px 16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>Tipe Event</th>
                      <th style={{ padding: "12px 16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>Deskripsi Aktivitas</th>
                      <th style={{ padding: "12px 16px", color: "#475569", fontWeight: "600", fontSize: "14px" }}>IP Address Pengakses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: "24px", color: "#64748b", textAlign: "center", fontSize: "14px" }}>
                          Belum ada log aktivitas keamanan terdeteksi. Sistem berjalan normal.
                        </td>
                      </tr>
                    ) : (
                      securityLogs.map((log) => {
                        let badgeBg = "#f1f5f9";
                        let badgeColor = "#475569";
                        if (log.event_type === "FAILED_LOGIN") { badgeBg = "#fff7ed"; badgeColor = "#ea580c"; }
                        else if (log.event_type === "BLOCKED_UPLOAD") { badgeBg = "#fef2f2"; badgeColor = "#ef4444"; }
                        else if (log.event_type === "BLOCKED_API") { badgeBg = "#eff6ff"; badgeColor = "#2563eb"; }
                        else if (log.event_type === "SUCCESSFUL_LOGIN") { badgeBg = "#f0fdf4"; badgeColor = "#16a34a"; }

                        return (
                          <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                            <td style={{ padding: "12px 16px", color: "#64748b" }}>
                              {new Date(log.created_at).toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{
                                background: badgeBg,
                                color: badgeColor,
                                padding: "4px 10px",
                                borderRadius: "30px",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "inline-block"
                              }}>
                                {log.event_type}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{log.description}</td>
                            <td style={{ padding: "12px 16px", color: "#475569", fontFamily: "monospace" }}>{log.ip_address}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

          const handleSelectAll = (e) => {
            if (e.target.checked) {
              const ids = paginated.map(i => i.id).filter(Boolean);
              setSelectedIds(prev => [...new Set([...prev, ...ids])]);
            } else {
              const ids = paginated.map(i => i.id);
              setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            }
          };

          const handleSelect = (id) => {
            if (!id) return;
            if (selectedIds.includes(id)) {
              setSelectedIds(prev => prev.filter(i => i !== id));
            } else {
              setSelectedIds(prev => [...prev, id]);
            }
          };

          const isAllSelected = paginated.length > 0 && paginated.every(i => i.id && selectedIds.includes(i.id));

          const handleBulkDelete = async () => {
            if (!selectedIds.length) return;
            if (!(user?.username === "adminRAL" || user?.role !== "PETUGAS")) {
              alert("Hanya admin dan supervisi yang dapat menghapus data.");
              return;
            }
            if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data inspeksi ini secara permanen?`)) {
              return;
            }

            try {
              const promises = selectedIds.map(id => fetch(`${API_URL}/api/inspection/${id}`, { method: "DELETE" }));
              await Promise.all(promises);
              
              const arr = Array.isArray(historyData) ? historyData : [];
              const updatedData = arr.filter(item => !selectedIds.includes(item.id));
              setHistoryData(updatedData);
              localStorage.setItem("history", JSON.stringify(updatedData));
              window.dispatchEvent(new Event("storage"));
              
              alert(`${selectedIds.length} data berhasil dihapus.`);
              setSelectedIds([]);
            } catch (err) {
              console.error("Bulk delete error:", err);
              alert("Sebagian atau seluruh data gagal dihapus. Periksa koneksi Anda.");
            }
          };

          const handleBulkExport = () => {
             const itemsToExport = filtered.filter(item => selectedIds.includes(item.id));
             if (itemsToExport.length === 0) return;
             
             const headers = ["No", "Tanggal", "Container", "Kapal/Voy", "ISO", "Kategori", "Status", "Kondisi", "Sisi", "Catatan", "Petugas", "Grup"];
             const exportData = [...itemsToExport].sort((a, b) => {
               if (!a.date || !b.date) return 0;
               return new Date(a.date) - new Date(b.date);
             });

             const rows = exportData.map((item, index) => [
               index + 1,
               item.date ? new Date(item.date).toLocaleString("id-ID").replace(/,/g, "") : "-",
               item.container || "",
               item.shipName || "",
               item.iso || "",
               item.category || "",
               item.status || "",
               item.condition || "",
               item.side || "",
               (item.note || "").replace(/\n/g, " "),
               item.petugas || "",
               item.group || ""
             ]);
             const csvContent = [
               headers.map(h => `"${h}"`).join(","),
               ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
             ].join("\n");
             const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
             const url = URL.createObjectURL(blob);
             const link = document.createElement("a");
             link.setAttribute("href", url);
             link.setAttribute("download", `Bulk_Export_Inspeksi_${new Date().toISOString().slice(0,10)}.csv`);
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
          };

          const handleExportCSV = () => {
            if (filtered.length === 0) {
              alert("Tidak ada data untuk diekspor.");
              return;
            }
            const headers = ["No", "Tanggal", "Container", "Kapal/Voy", "ISO", "Kategori", "Status", "Kondisi", "Sisi", "Catatan", "Petugas", "Grup"];
            // Sort filtered by date ascending for export
            const exportData = [...filtered].sort((a, b) => {
              if (!a.date || !b.date) return 0;
              return new Date(a.date) - new Date(b.date);
            });

            const rows = exportData.map((item, index) => [
              index + 1,
              item.date ? new Date(item.date).toLocaleString("id-ID").replace(/,/g, "") : "-",
              item.container || "",
              item.shipName || "",
              item.iso || "",
              item.category || "",
              item.status || "",
              item.condition || "",
              item.side || "",
              (item.note || "").replace(/\n/g, " "),
              item.petugas || "",
              item.group || ""
            ]);
            const csvContent = [
              headers.map(h => `"${h}"`).join(","),
              ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
            ].join("\n");
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

              {/* Floating Action Bar for Bulk Actions */}
              {selectedIds.length > 0 && (
                <div style={{
                  background: "#1e293b",
                  color: "white",
                  padding: "16px 24px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  animation: "slideDown 0.3s ease-out"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ background: "#3b82f6", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>
                      {selectedIds.length} Terpilih
                    </span>
                    <span style={{ fontSize: "15px" }}>Pilih aksi massal untuk data ini:</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                      onClick={handleBulkExport}
                      style={{ background: "#10b981", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Download size={18} /> Export CSV
                    </button>
                    {(user?.username === "adminRAL" || user?.role !== "PETUGAS") && (
                      <button 
                        onClick={handleBulkDelete}
                        style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <Trash2 size={18} /> Hapus Massal
                      </button>
                    )}
                  </div>
                </div>
              )}

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
                  <th style={{ width: "40px", textAlign: "center" }}>
                    <input 
                      type="checkbox" 
                      checked={isAllSelected} 
                      onChange={handleSelectAll} 
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  </th>
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
                {isDataLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="skeleton-row">
                      <td><div className="skeleton-line" style={{width: "20px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "20px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "120px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "110px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "90px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "80px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "70px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "90px"}}></div></td>
                      <td><div className="skeleton-line" style={{width: "140px"}}></div></td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan="9" style={{textAlign:"center", padding:"30px", color:"#64748b"}}>Tidak ada data inspeksi</td></tr>
                ) : (
                  paginated.map((item, index) => {
                    const absoluteIndex = (currentPage - 1) * 10 + index + 1;
                    return (
                      <tr key={index} className={selectedIds.includes(item.id) ? "selected-row" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input 
                            type="checkbox" 
                            checked={item.id ? selectedIds.includes(item.id) : false} 
                            onChange={() => handleSelect(item.id)} 
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                        </td>
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
                  })
                )}
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
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
