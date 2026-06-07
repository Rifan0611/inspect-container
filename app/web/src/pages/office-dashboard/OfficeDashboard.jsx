// =========================================
// FILE:
// src/pages/office-dashboard/OfficeDashboard.jsx
// =========================================

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import UserManagement from "./UserManagement";
import API_URL from "../../config/api";
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
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

import "./OfficeDashboard.css";

/* =========================================
   DATA CHART
========================================= */

const lineData = [
  { day: "01/05", value: 40 },
  { day: "05/05", value: 70 },
  { day: "10/05", value: 35 },
  { day: "15/05", value: 90 },
  { day: "20/05", value: 60 },
  { day: "24/05", value: 75 },
];

const pieData = [
  {
    name: "Dented",
    value: 38,
    color: "#2563eb",
  },

  {
    name: "Bent",
    value: 22,
    color: "#ef4444",
  },

  {
    name: "Broken",
    value: 12,
    color: "#f59e0b",
  },

  {
    name: "Hole",
    value: 8,
    color: "#22c55e",
  },

  {
    name: "Lainnya",
    value: 20,
    color: "#94a3b8",
  },
];

/* =========================================
   COMPONENT
========================================= */

const OfficeDashboard = ({
  user,
  onLogout,
  manifestData,
  setManifestData
}) => {

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [activeMenu, setActiveMenu] =
    useState("dashboard");

  const [search, setSearch] =
    useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importSuccessMessage, setImportSuccessMessage] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);

  const handleDeleteInspection = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data inspeksi ini secara permanen?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/inspection/${id}`, {
        method: "DELETE"
      });
      const result = await response.json();
      if (response.ok) {
        alert("Data inspeksi berhasil dihapus.");
        // Immediate local state refresh
        const updatedData = historyData.filter(item => item.id !== id);
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

  /* MANIFEST */
  
  const [manifestShipName, setManifestShipName] =
    useState("");

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
        minute: "2-digit"
      });
      str = str.replace(/\bpukul\b/i, "").replace(/\s+/g, " ").trim();
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
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
        year: "numeric"
      });
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      for (const day of days) {
        if (datePart.startsWith(day) && !datePart.startsWith(day + ",")) {
          datePart = datePart.replace(day, day + ",");
          break;
        }
      }
      const timePart = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }).replace(":", ".");
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
        year: "numeric"
      });
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
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
      const timePart = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }).replace(":", ".");
      return `${timePart} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const [historyData, setHistoryData] =
    React.useState(
      JSON.parse(
        localStorage.getItem("history")
      ) || []
    );

  // Auto-refresh riwayat inspeksi saat database berubah atau berkala (real-time sync)
  useEffect(() => {
    const refreshHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/inspection`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistoryData(data);
          localStorage.setItem("history", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load inspections from database:", err);
        const latest = JSON.parse(localStorage.getItem("history")) || [];
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

  const [showAdminPanel, setShowAdminPanel] =
    React.useState(false);

  const [managerName, setManagerName] =
    React.useState("Rian Agung");

  const [supervisorName, setSupervisorName] =
    React.useState("Budi Santoso");

  const [assistantName, setAssistantName] =
    React.useState("Andi Wijaya");

  const [petugasName, setPetugasName] =
    React.useState("Petugas Lapangan");

  /* ACCOUNT SYSTEM */

  const [accounts, setAccounts] =
React.useState(
JSON.parse(
localStorage.getItem("accounts")
) || [
{
username:"manager",
password:"123",
jabatan:"MANAGER"
},
{
username:"supervisor",
password:"123",
jabatan:"SUPERVISOR"
},
{
username:"assistant",
password:"123",
jabatan:"ASSISTANT SUPERVISOR"
},
{
username:"petugas",
password:"123",
jabatan:"PETUGAS"
}
]
);
const addUser = () => {

  if(
    !newUsername ||
    !newPassword
  ){
    alert("Lengkapi data");
    return;
  }

  const newUser = {

    username:newUsername,
    password:newPassword,
    jabatan:newJabatan,
    active:true

  };

  const updated =
  [...accounts,newUser];

  setAccounts(updated);

  localStorage.setItem(
    "accounts",
    JSON.stringify(updated)
  );

  setNewUsername("");
  setNewPassword("");

  alert("User berhasil dibuat");

};

const deleteUser = (index) => {

  const updated =
  accounts.filter(
    (_,i)=>i!==index
  );

  setAccounts(updated);

  localStorage.setItem(
    "accounts",
    JSON.stringify(updated)
  );

};

  const [newUsername, setNewUsername] =
    React.useState("");

  const [newPassword, setNewPassword] =
    React.useState("");

  const [newJabatan, setNewJabatan] =
    React.useState("PETUGAS");

  /* DYNAMIC CHART & STATS CALCULATIONS */
  const getDynamicLineData = () => {
    if (!historyData || historyData.length === 0) {
      return [
        { day: "N/A", value: 0 }
      ];
    }
    const counts = {};
    const sorted = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(item => {
      if (!item.date) return;
      try {
        const d = new Date(item.date);
        const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        counts[formatted] = (counts[formatted] || 0) + 1;
      } catch (e) {}
    });
    return Object.keys(counts).map(day => ({
      day,
      value: counts[day]
    }));
  };

  const getDynamicPieData = () => {
    const damagedInspections = historyData.filter(
      item => item.condition && item.condition.toUpperCase() !== "GOOD"
    );
    if (damagedInspections.length === 0) {
      return [
        { name: "Tidak ada kerusakan", value: 1, color: "#22c55e" }
      ];
    }
    const counts = {};
    damagedInspections.forEach(item => {
      const cond = item.condition || "Lainnya";
      counts[cond] = (counts[cond] || 0) + 1;
    });
    const colors = ["#2563eb", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6", "#10b981", "#ff7a00"];
    return Object.keys(counts).map((name, index) => ({
      name,
      value: counts[name],
      color: colors[index % colors.length]
    }));
  };

  const dynamicLineData = getDynamicLineData();
  const dynamicPieData = getDynamicPieData();

  const totalInspeksi = historyData.length;
  const totalDamage = historyData.filter(item => item.condition && item.condition.toUpperCase() !== "GOOD").length;
  const totalGood = historyData.filter(item => item.condition && item.condition.toUpperCase() === "GOOD").length;
  const damagePercentage = totalInspeksi > 0 ? ((totalDamage / totalInspeksi) * 100).toFixed(1) + "%" : "0%";
  const goodPercentage = totalInspeksi > 0 ? ((totalGood / totalInspeksi) * 100).toFixed(1) + "%" : "0%";
  const petugasAktif = new Set(historyData.map(item => item.petugas).filter(Boolean)).size || 0;

  const containerFull = manifestData.filter(item => item.status && item.status.toUpperCase().includes("FULL")).length || historyData.filter(item => item.status && item.status.toUpperCase().includes("FULL")).length || 0;
  const containerEmpty = manifestData.filter(item => item.status && (item.status.toUpperCase().includes("EMPTY") || item.status.toUpperCase().includes("MT"))).length || historyData.filter(item => item.status && (item.status.toUpperCase().includes("EMPTY") || item.status.toUpperCase().includes("MT"))).length || 0;
  const waitingRepair = totalDamage;

  const getInspectionsToday = () => {
    const today = new Date().toDateString();
    return historyData.filter(item => {
      if (!item.date) return false;
      return new Date(item.date).toDateString() === today;
    }).length;
  };
  const inspectionsToday = getInspectionsToday();

  /* UPLOAD EXCEL / IMPORT SUBMIT */
  const handleExcelImportSubmit = async () => {
    if (!manifestShipName) {
      alert("Harap isi Nama Kapal terlebih dahulu!");
      return;
    }
    if (!selectedFile) {
      alert("Harap pilih file Excel terlebih dahulu!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(
  sheet,
  {
    defval: "",
    raw: false
  }
);

console.log("JSON DATA:", jsonData);

        const formattedData = jsonData.map((item, index) => ({

  id: index + 1,

  container: String(
    item.container ||
    item.CONTAINER ||
    item.Container ||
    item["Container Number"] ||
    item["Container No"] ||
    item["Container Id"] ||
    ""
  ).toUpperCase().trim(),

  shipName: manifestShipName,

  status: String(
    item.status ||
    item.STATUS ||
    item.Status ||
    item["MT/FULL"] ||
    item["FULL/EMPTY"] ||
    item.Loaded ||
    ""
  ).toUpperCase().trim(),

  iso: String(
    item.iso ||
    item.ISO ||
    item.Iso ||
    item["ISO CODE"] ||
    item["ISO"] ||
    item.Size ||
    ""
  ).trim(),

  category: String(
    item.category ||
    item.CATEGORY ||
    item.Category ||
    item["CATEGORY"] ||
    item.Type ||
    ""
  ).trim()

}));
const validData =
formattedData.filter(
  item => item.container
);

if(validData.length === 0){

  alert(
    "Header Excel tidak sesuai format."
  );

  return;

}
        

setManifestData(validData);

localStorage.setItem(
  "manifestData",
  JSON.stringify(validData)
);

await fetch(
  `${API_URL}/api/manifest`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(validData)
  }
);
        setImportSuccessMessage(`Berhasil import ${formattedData.length} container dari file ${fileName}`);
        alert("Manifest berhasil diimport");
      } 
      
      catch (err) {

  console.error(err);

  alert(
    "ERROR : " + err.message
  );

}
    };
    reader.readAsArrayBuffer(selectedFile);
  };


  return (
    <div className="dashboard-layout">

  {/* SIDEBAR */}
  <aside
    className={`sidebar ${
      sidebarOpen ? "open" : "closed"
    }`}
  >

    {/* TOGGLE BUTTON */}
    <button
      className="toggle-btn"
      onClick={() =>
        setSidebarOpen(!sidebarOpen)
      }
    >
      ☰
    </button>

    {/* LOGO */}
    <div className="logo-section">

      <div className="logo-box">
        N
      </div>

      {sidebarOpen && (

        <div>

          <h1 className="logo-title">
            NPH
          </h1>

          <p className="logo-subtitle">
            ADIPURUSA
          </p>

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
      activeMenu === "dashboard"
        ? "active"
        : ""
    }`}
    onClick={() => {

      setActiveMenu("dashboard");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }}
  >

    <Home
      className="menu-icon"
      size={20}
    />

    {sidebarOpen && (
      <span>Dashboard</span>
    )}

  </button>

  {/* DATA INSPEKSI */}
  <button
    className={`menu-item ${
      activeMenu === "inspeksi"
        ? "active"
        : ""
    }`}
    onClick={() => {

      setActiveMenu("inspeksi");

      document
        .getElementById(
          "table-inspeksi"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });

    }}
  >

    <ClipboardList
      className="menu-icon"
      size={20}
    />

    {sidebarOpen && (
      <span>Data Inspeksi</span>
    )}

  </button>

  {/* MANIFEST */}
  <button
    className={`menu-item ${
      activeMenu === "manifest"
        ? "active"
        : ""
    }`}
    onClick={() => {

      setActiveMenu("manifest");

      document
        .getElementById(
          "upload-manifest"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });

    }}
  >

    <FileText
      className="menu-icon"
      size={20}
    />

    {sidebarOpen && (
      <span>Manifest Kapal</span>
    )}

  </button>

  {/* LAPORAN */}
  <button
    className={`menu-item ${
      activeMenu === "laporan"
        ? "active"
        : ""
    }`}
    onClick={() => {

      setActiveMenu("laporan");

      document
        .getElementById(
          "laporan-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });

    }}
  >

    <PieChartIcon
      className="menu-icon"
      size={20}
    />

    {sidebarOpen && (
      <span>Laporan</span>
    )}

  </button>

  {/* USER */}
<button
  className={`menu-item ${
    activeMenu === "user"
      ? "active"
      : ""
  }`}
  onClick={() => {
    setActiveMenu("user");
    if (user?.role === "ADMIN") {
      setShowAdminPanel(true);
      setTimeout(() => {
        document
          .getElementById("user-section")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } else {
      alert("Hanya Admin yang dapat mengelola pengguna.");
    }
  }}
>

  <Users
    className="menu-icon"
    size={20}
  />

  {sidebarOpen && (
    <span>User</span>
  )}

</button>

</div>
  <button className="menu-item">

    <Settings
      className="menu-icon"
      size={20}
    />

    {sidebarOpen && (
      <span>Pengaturan</span>
    )}

  </button>

</div>

    {/* LOGOUT */}
    <div className="logout-section">

      <button
        className="logout-btn"
        onClick={onLogout}
      >

        <LogOut
  className="menu-icon"
  size={20}
/>

        {sidebarOpen && (
          <span>Logout</span>
        )}

      </button>

    </div>

  </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* HEADER */}
        <div className="top-header">

          <div>

            <h2 className="page-title">
              Dashboard Kantor
            </h2>

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
              Selamat Datang,
              {" "}
              {user?.nama}
            </h3>

            <p className="page-subtitle">
              Sistem Monitoring Inspeksi Kontainer
            </p>

          </div>

    {/* ACTION */}
<div className="header-actions">



{
user?.role === "ADMIN" && (

<button
className="notif-btn"
onClick={() =>
setShowAdminPanel(
!showAdminPanel
)
}
>

<Settings size={20} />

</button>

)
}

  {/* SEARCH */}
  
<div className="search-box">

  <Search
    size={20}
    className="search-icon"
  />

  <input
    type="text"
    placeholder="Cari nomor container..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="search-input"
  />

</div>

  {/* NOTIF */}
  <button className="notif-btn">

    <Bell size={20} />

  </button>

</div>    

</div>

{
showAdminPanel &&
user?.role === "ADMIN" && (
  <div id="user-section">
    <UserManagement />
  </div>
)
}

        {/* UPLOAD MANIFEST */}
        {(user?.role === "ADMIN" ||
          user?.role === "MANAGER" ||
          user?.role === "SUPERVISOR" ||
          user?.role === "ASSISTANT SUPERVISOR" ||
          user?.role === "ADMIN REPORT") ? (
          
          <div className="upload-card-new" id="upload-manifest">
            <h3 className="card-title">Upload Manifest Kapal</h3>
            
            <div className="upload-form-row">
              {/* INPUT NAMA KAPAL */}
              <div className="form-group-manifest">
                <label>Nama Kapal <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="Contoh: MERATUS JAYAKARTA"
                  value={manifestShipName}
                  onChange={(e) => setManifestShipName(e.target.value)}
                  className="input-vessel"
                />
              </div>

              {/* UPLOAD FILE EXCEL */}
              <div className="form-group-manifest">
                <label>Upload File Excel <span className="required-star">*</span></label>
                <div 
                  className="file-upload-container"
                  onClick={() => document.getElementById("file-manifest-input").click()}
                >
                  <span className="file-icon">📄</span>
                  <span className="file-name-text">
                    {fileName || "Pilih file Excel (.xlsx, .xls)"}
                  </span>
                  {fileName && <span className="file-check-icon">✓</span>}
                  <input
                    id="file-manifest-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setFileName(file.name);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </div>
                <span className="file-info-text">File Excel: .xlsx, .xls (maks. 5MB)</span>
              </div>

              {/* BUTTON UPLOAD */}
              <button 
                type="button" 
                className="btn-upload-import"
                onClick={handleExcelImportSubmit}
              >
                <Upload size={18} />
                <span>Upload & Import</span>
              </button>
            </div>

            {/* ALERT SUCCESS */}
            {importSuccessMessage && (
              <div className="import-success-alert">
                <span className="alert-check-icon">✓</span>
                <span>{importSuccessMessage}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* STATS */}
        <div className="stats-grid">
          <StatCard
            title="Total Inspeksi"
            value={totalInspeksi.toLocaleString("id-ID")}
            subtitle={`+${inspectionsToday} hari ini`}
            color="blue"
          />

          <StatCard
            title="Damage"
            value={totalDamage.toLocaleString("id-ID")}
            subtitle={damagePercentage}
            color="orange"
          />

          <StatCard
            title="Good"
            value={totalGood.toLocaleString("id-ID")}
            subtitle={goodPercentage}
            color="green"
          />

          <StatCard
            title="Petugas Aktif"
            value={String(petugasAktif)}
            subtitle="Online"
            color="purple"
          />
        </div>
{/* STATUS REALTIME */}

<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginBottom:"24px"
}}
>

<div className="chart-card">

<h3>
Container Full
</h3>

<h1
style={{
fontSize:"48px",
fontWeight:"bold",
color:"#2563eb"
}}
>
{containerFull}
</h1>

</div>

<div className="chart-card">

<h3>
Container Empty
</h3>

<h1
style={{
fontSize:"48px",
fontWeight:"bold",
color:"#f97316"
}}
>
{containerEmpty}
</h1>

</div>

<div className="chart-card">

<h3>
Waiting Repair
</h3>

<h1
style={{
fontSize:"48px",
fontWeight:"bold",
color:"#ef4444"
}}
>
{waitingRepair}
</h1>

</div>

</div>
        {/* CHART */}
        <div
          className="chart-grid"
          id="laporan-section"
        >

          {/* LINE */}
          <div className="chart-card">

            <h3>
              Grafik Inspeksi
            </h3>

            <div className="real-chart">

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart data={dynamicLineData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="day" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={4}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* PIE */}
          <div className="chart-card">

            <h3>
              Damage Container
            </h3>

            <div className="real-chart">

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <RePieChart>

                  <Pie
                    data={dynamicPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  >

                    {dynamicPieData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={entry.color}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </RePieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* RIWAYAT INSPEKSI */}
        <div
          className="table-card"
          style={{
            marginTop: "24px"
          }}
        >

          <div className="table-header">

            <h3>
              Riwayat Inspeksi
            </h3>

          </div>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>No</th>

                  <th>Tanggal</th>

                  <th>Container</th>

                  <th>Kapal</th>

                  <th>Petugas</th>

                  <th>Grup</th>

                  <th>Kondisi</th>

                  <th>Sisi</th>

                  <th>Aksi</th>

                </tr>

              </thead>

<tbody>

{
historyData.map((item,index)=>(

<tr key={index}>

<td>
{index + 1}
</td>

<td>

{formatInspectionDate(item.date)}

</td>

<td>
{item.container}
</td>

<td>
{item.shipName}
</td>

<td>
{item.petugas || "Petugas Lapangan"}
</td>

<td>
{item.group || "Lapangan"}
</td>

<td>

<span
className={`status-badge ${
item.condition === "GOOD"
? "good"
: "damage"
}`}
>

{item.condition}

</span>

</td>

<td>
{item.side}
</td>

<td>
                          <button
                            className="detail-btn"
                            style={{ marginRight: "8px" }}
                            onClick={() => setSelectedInspection(item)}
                            title="Lihat Detail Inspeksi"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="detail-btn"
                            onClick={()=>{

const win =
window.open(
"",
"",
"width=1200,height=900"
);

win.document.write(`

<html>

<head>

<title>
BERITA ACARA
</title>

<style>

*{
box-sizing:border-box;
}

@page{
size:A4;
margin:10mm;
}

body{

font-family:Arial,sans-serif;
padding:12px;
font-size:10px;
color:#000;
margin:0;
background:#fff;
-webkit-print-color-adjust:exact;
print-color-adjust:exact;

}

.header{

display:flex;
justify-content:space-between;
align-items:flex-end;
border-bottom:3px solid #004aad;
padding-bottom:8px;
margin-bottom:12px;

}

.logo{

width:130px;
display:block;
margin-bottom:-4px;

}

.company{

text-align:right;

}

.company h2{

margin:0;
font-size:15px;
font-weight:bold;
color:#004aad;

}

.company p{

margin:1px 0;
font-size:9px;

}

.title{

text-align:center;
font-size:15px;
font-weight:bold;
margin:10px 0 15px 0;
letter-spacing:1px;

}

table{

width:100%;
border-collapse:collapse;
margin-bottom:12px;

}

td{

border:1px solid #000;
padding:6px;
font-size:10px;

}

.label{

font-weight:bold;
background:#f3f3f3;
width:35%;

}

.note-title{

font-weight:bold;
margin-bottom:6px;
margin-top:8px;
font-size:10px;

}

.note{

border:1px solid #000;
padding:8px;
height:80px;
font-size:10px;
margin-bottom:12px;

}

.photo-title{

font-weight:bold;
margin-bottom:10px;
font-size:10px;

}

.photo-grid{

display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
margin-bottom:20px;

}

.photo-box{

text-align:center;

}

.photo-label{

font-size:10px;
font-weight:bold;
margin-bottom:6px;

}

.photo-box img{

width:100%;
height:165px;
object-fit:cover;
border-radius:8px;
border:2px solid #004aad;

}

.footer{

display:flex;
justify-content:space-between;
margin-top:25px;

}

.ttd{

width:220px;
text-align:center;
font-size:10px;

}

.ttd-line{

margin-top:55px;

}

@media print{

html,body{

width:210mm;
height:297mm;
overflow:hidden;

}

}

</style>

</head>

<body>

<div class="header">

<img
src="${window.location.origin}/logo.png"
class="logo"
/>

<div class="company">

<h2>
NPH ADIPURUSA
</h2>

<p>
Container Inspection System
</p>

</div>

</div>

<div class="title">

BERITA ACARA CONTAINER INSPECTION

</div>

<table>

<tr>
<td class="label">
Nomor Container
</td>

<td>
${item.container || "-"}
</td>
</tr>

<tr>
<td class="label">
Nama Kapal
</td>

<td>
${item.shipName || "-"}
</td>
</tr>

<tr>
<td class="label">
Status
</td>

<td>
${item.status || "-"}
</td>
</tr>

<tr>
<td class="label">
ISO
</td>

<td>
${item.iso || "-"}
</td>
</tr>

<tr>
<td class="label">
Category
</td>

<td>
${item.category || "-"}
</td>
</tr>

<tr>
<td class="label">
Kondisi
</td>

<td>
${item.condition || "-"}
</td>
</tr>

<tr>
<td class="label">
Sisi
</td>

<td>
${item.side || "-"}
</td>
</tr>

<tr>
<td class="label">
Hari & Tanggal
</td>

<td>
${formatInspectionDatePart(item.date)}
</td>

</tr>

<tr>
<td class="label">
Waktu
</td>

<td>
${formatInspectionTimePart(item.date)}
</td>

</tr>

<tr>
<td class="label">
Grup Petugas
</td>

<td>
${item.group || "Lapangan"}
</td>

</tr>

</table>

<div class="note-title">

CATATAN KRONOLOGI

</div>

<div class="note">

${item.note || "-"}

</div>

<div class="photo-title">

FOTO INSPEKSI

</div>

<div class="photo-grid">

<div class="photo-box">

<div class="photo-label">

FOTO CONTAINER

</div>

${
item.photo1
?
`<img src="${item.photo1}" />`
:
""
}

</div>

<div class="photo-box">

<div class="photo-label">

FOTO DAMAGE

</div>

${
item.photo2
?
`<img src="${item.photo2}" />`
:
""
}

</div>

</div>

<div class="footer">

<div class="ttd">

<div>
Petugas Inspeksi
</div>

<div class="ttd-line">

( ${item.petugas || "Petugas Lapangan"} )

</div>

</div>

<div class="ttd">

<div>
Supervisor
</div>

<div class="ttd-line">

(................................)

</div>

</div>

</div>

</body>

</html>

`);

win.document.close();

setTimeout(()=>{

win.print();

},500);

}}

>

                          PDF
                          
                          </button>
                          
                          <button
                            className="delete-btn"
                            style={{ marginLeft: "8px" }}
                            onClick={() => handleDeleteInspection(item.id)}
                            title="Hapus Inspeksi"
                          >
                            <Trash2 size={18} />
                          </button>
                          
                          </td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

      </main>

      {/* DETAIL MODAL */}
      {selectedInspection && (
        <div className="modal-overlay" onClick={() => setSelectedInspection(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Detail Inspeksi: {selectedInspection.container}</h4>
              <button className="btn-close-modal" onClick={() => setSelectedInspection(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Nama Kapal</div>
                  <div className="info-val">{selectedInspection.shipName || "-"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Kondisi</div>
                  <div className="info-val">{selectedInspection.condition || "-"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Sisi Kerusakan</div>
                  <div className="info-val">{selectedInspection.side || "-"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Petugas Pemeriksa</div>
                  <div className="info-val">{selectedInspection.petugas || "Petugas Lapangan"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Grup Petugas</div>
                  <div className="info-val">{selectedInspection.group || "Lapangan"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Waktu Inspeksi</div>
                  <div className="info-val">
                    {formatInspectionDate(selectedInspection.date)}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">ISO / Status</div>
                  <div className="info-val">{selectedInspection.iso || "-"} / {selectedInspection.status || "-"}</div>
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
                    {selectedInspection.photo1 ? (
                      <img src={selectedInspection.photo1} alt="Foto Container" />
                    ) : (
                      <div className="no-photo-text">Tidak ada foto</div>
                    )}
                  </div>
                  <div className="photo-card">
                    <span>FOTO DAMAGE / DETAIL</span>
                    {selectedInspection.photo2 ? (
                      <img src={selectedInspection.photo2} alt="Foto Kerusakan" />
                    ) : (
                      <div className="no-photo-text">Tidak ada foto</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




/* =========================================
   CARD
========================================= */

function StatCard({
  title,
  value,
  subtitle,
  color,
}) {

  const icons = {
    blue:"📦",
    orange:"⚠️",
    green:"✅",
    purple:"👨‍💼"
  };

  return (
    <div className={`stat-card ${color}`}>

      <div
        style={{
          fontSize:"28px",
          marginBottom:"10px"
        }}
      >
        {icons[color]}
      </div>

      <p>{title}</p>

      <h2>{value}</h2>

      {subtitle && (
        <span className="stat-card-subtitle">
          {subtitle}
        </span>
      )}

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
  kapal,
  petugas,
  kondisi,
  sisi,
}) {
  return (
    <tr>

      <td>{no}</td>

      <td>{tanggal}</td>

      <td>{container}</td>

      <td>{kapal}</td>

      <td>{petugas}</td>

      <td>

        <span
          className={`status-badge ${
            kondisi === "Good"
              ? "good"
              : "damage"
          }`}
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

border:"1px solid #cbd5e1",
padding:"12px",
background:"#f1f5f9"

};

const tdStyle = {

border:"1px solid #cbd5e1",
padding:"12px"


};

export default OfficeDashboard;