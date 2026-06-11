// =========================================
// FILE:
// src/pages/office-dashboard/OfficeDashboard.jsx
// =========================================

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import UserManagement from "./UserManagement";
import API_URL from "../../config/api";
import SearchSelect, {
  ISO_CODES,
  CATEGORIES,
} from "../../components/SearchSelect";
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

const parsePhotos = (photoStr) => {
  if (!photoStr) return [];
  if (photoStr.includes("|")) return photoStr.split("|");
  if (photoStr.startsWith("data:image")) return [photoStr];
  return photoStr.split(",");
};

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
  setManifestData,
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importSuccessMessage, setImportSuccessMessage] = useState("");
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
      setEditCondition(editingInspection.condition || "GOOD");
      setEditSide(editingInspection.side || "");
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

    if (!editContainer || !editCondition || !editPetugas || !editDate) {
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
            iso: editIso,
            category: editCategory,
            condition: editCondition,
            side: editSide,
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
              iso: editIso,
              category: editCategory,
              condition: editCondition,
              side: editSide,
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
    if (user?.username !== "adminRAL") {
      alert("Hanya admin utama (adminRAL) yang dapat menghapus data.");
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

  /* MANIFEST */

  const [manifestShipName] = useState("-");

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
        const response = await fetch(`${API_URL}/api/inspection`);
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

  /* DYNAMIC CHART & STATS CALCULATIONS */
  const getDynamicLineData = () => {
    const arr = Array.isArray(historyData) ? historyData : [];
    if (arr.length === 0) {
      return [{ day: "N/A", value: 0 }];
    }
    const counts = {};
    const sorted = [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach((item) => {
      if (!item.date) return;
      try {
        const d = new Date(item.date);
        const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        counts[formatted] = (counts[formatted] || 0) + 1;
      } catch (e) {}
    });
    return Object.keys(counts).map((day) => ({
      day,
      value: counts[day],
    }));
  };

  const getDynamicPieData = () => {
    const arr = Array.isArray(historyData) ? historyData : [];
    const damagedInspections = arr.filter(
      (item) => item.condition && item.condition.toUpperCase() !== "GOOD",
    );
    if (damagedInspections.length === 0) {
      return [{ name: "Tidak ada kerusakan", value: 1, color: "#22c55e" }];
    }
    const counts = {};
    damagedInspections.forEach((item) => {
      const cond = item.condition || "Lainnya";
      counts[cond] = (counts[cond] || 0) + 1;
    });
    const colors = [
      "#2563eb",
      "#ef4444",
      "#f59e0b",
      "#22c55e",
      "#8b5cf6",
      "#10b981",
      "#ff7a00",
    ];
    return Object.keys(counts).map((name, index) => ({
      name,
      value: counts[name],
      color: colors[index % colors.length],
    }));
  };

  const getStatsPerGroup = () => {
    const arr = Array.isArray(historyData) ? historyData : [];
    const counts = {};
    arr.forEach((item) => {
      if (!item) return;
      const gp = item.group || "Lainnya";
      counts[gp] = (counts[gp] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  };

  const getStatsPerPetugas = () => {
    const arr = Array.isArray(historyData) ? historyData : [];
    const counts = {};
    arr.forEach((item) => {
      if (!item) return;
      const pet = item.petugas || "Petugas Lapangan";
      counts[pet] = (counts[pet] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  };

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

  const dynamicLineData = getDynamicLineData();
  const dynamicPieData = getDynamicPieData();

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

  /* UPLOAD EXCEL / IMPORT SUBMIT */
  const handleExcelImportSubmit = async () => {
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
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });

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
              "",
          )
            .toUpperCase()
            .trim(),

          shipName: manifestShipName,

          status: String(
            item.status ||
              item.STATUS ||
              item.Status ||
              item["MT/FULL"] ||
              item["FULL/EMPTY"] ||
              item.Loaded ||
              "",
          )
            .toUpperCase()
            .trim(),

          iso: String(
            item.iso ||
              item.ISO ||
              item.Iso ||
              item["ISO CODE"] ||
              item["ISO"] ||
              item.Size ||
              "",
          ).trim(),

          category: String(
            item.category ||
              item.CATEGORY ||
              item.Category ||
              item["CATEGORY"] ||
              item.Type ||
              "",
          ).trim(),
        }));
        const validData = formattedData.filter((item) => item.container);

        if (validData.length === 0) {
          alert("Header Excel tidak sesuai format.");

          return;
        }

        setManifestData(validData);

        localStorage.setItem("manifestData", JSON.stringify(validData));

        await fetch(`${API_URL}/api/manifest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validData),
        });
        setImportSuccessMessage(
          `Berhasil import ${formattedData.length} container dari file ${fileName}`,
        );
        alert("Manifest berhasil diimport");
      } catch (err) {
        console.error(err);

        alert("ERROR : " + err.message);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

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

            {/* MANIFEST */}
            <button
              className={`menu-item ${
                activeMenu === "manifest" ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu("manifest");
                if (window.innerWidth <= 900) setSidebarOpen(false);

                document.getElementById("upload-manifest")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <FileText className="menu-icon" size={20} />

              {sidebarOpen && <span>Manifest Kapal</span>}
            </button>

            {/* LAPORAN */}
            <button
              className={`menu-item ${
                activeMenu === "laporan" ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu("laporan");
                if (window.innerWidth <= 900) setSidebarOpen(false);

                document.getElementById("laporan-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <PieChartIcon className="menu-icon" size={20} />

              {sidebarOpen && <span>Laporan</span>}
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
          <button
            className={`menu-item ${activeMenu === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveMenu("settings");
              if (window.innerWidth <= 900) setSidebarOpen(false);
              setTimeout(() => {
                document.getElementById("settings-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 100);
            }}
          >
            <Settings className="menu-icon" size={20} />

            {sidebarOpen && <span>Pengaturan</span>}
          </button>
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

        {showAdminPanel && user?.username === "adminRAL" && (
          <div id="user-section">
            <UserManagement />
          </div>
        )}

        {/* RIWAYAT INSPEKSI */}
        <div
          id="table-inspeksi"
          className="table-card"
          style={{
            marginTop: "24px",
          }}
        >
          <div className="table-header">
            <h3>Riwayat Inspeksi</h3>
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
                {(() => {
                  const filtered = (
                    Array.isArray(historyData) ? historyData : []
                  ).filter((item) => {
                    if (!search.trim()) return true;
                    const q = search.toLowerCase().trim();
                    return (
                      (item.container || "").toLowerCase().includes(q) ||
                      (item.shipName || "").toLowerCase().includes(q) ||
                      (item.petugas || "").toLowerCase().includes(q) ||
                      (item.group || "").toLowerCase().includes(q) ||
                      (item.condition || "").toLowerCase().includes(q) ||
                      (item.side || "").toLowerCase().includes(q)
                    );
                  });
                  const paginated = filtered.slice(
                    (currentPage - 1) * 10,
                    currentPage * 10,
                  );

                  return paginated.map((item, index) => {
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
  onClick={() => {
    const win = window.open("", "", "width=1200,height=900");
    win.document.write(`
      <html>
      <head>
        <title>BERITA ACARA - Dokumen</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; padding: 12px; font-size: 10px; color: #000; margin: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #004aad; padding-bottom: 8px; margin-bottom: 12px; }
          .company { text-align: center; width: 100%; }
          .company h2 { margin: 0; font-size: 15px; font-weight: bold; color: #004aad; }
          .company p { margin: 1px 0; font-size: 9px; }
          .title { text-align: center; font-size: 15px; font-weight: bold; margin: 10px 0 15px 0; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          td { border: 1px solid #000; padding: 6px; font-size: 10px; }
          .label { font-weight: bold; background: #f3f3f3; width: 35%; }
          .note-title { font-weight: bold; margin-bottom: 6px; margin-top: 8px; font-size: 10px; }
          .note { border: 1px solid #000; padding: 8px; height: 80px; font-size: 10px; margin-bottom: 12px; }
          .footer { display: flex; justify-content: space-between; margin-top: 25px; }
          .ttd { width: 220px; text-align: center; font-size: 10px; }
          .ttd-line { margin-top: 55px; }
          @media print { html, body { width: 210mm; height: 297mm; overflow: hidden; } }
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
          <tr><td class="label">Nomor Container</td><td>${item.container || "-"}</td></tr>
          <tr><td class="label">Status</td><td>${item.status || "-"}</td></tr>
          <tr><td class="label">ISO</td><td>${item.iso || "-"}</td></tr>
          <tr><td class="label">Category</td><td>${item.category || "-"}</td></tr>
          <tr><td class="label">Kondisi</td><td>${item.condition || "-"}</td></tr>
          <tr><td class="label">Sisi</td><td>${item.side || "-"}</td></tr>
          <tr><td class="label">Hari & Tanggal</td><td>${formatInspectionDatePart(item.date)}</td></tr>
          <tr><td class="label">Waktu</td><td>${formatInspectionTimePart(item.date)}</td></tr>
          <tr><td class="label">Grup Petugas</td><td>${item.group || "Lapangan"}</td></tr>
        </table>
        <div class="note-title">CATATAN KRONOLOGI</div>
        <div class="note">${item.note || "-"}</div>
        <div class="footer">
          <div class="ttd"><div>Petugas Inspeksi</div><div class="ttd-line">( ${item.petugas || "Petugas Lapangan"} )</div></div>
          <div class="ttd"><div>Supervisor</div><div class="ttd-line">(................................)</div></div>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 500); }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  }}
  title="Cetak Dokumen"
>
  <FileText size={18} />
</button>

<button
  className="detail-btn"
  style={{ marginLeft: "8px" }}
  onClick={() => {
    const win = window.open("", "", "width=1200,height=900");
    win.document.write(`
      <html>
      <head>
        <title>BERITA ACARA - Foto</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; padding: 12px; font-size: 10px; color: #000; margin: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #004aad; padding-bottom: 8px; margin-bottom: 12px; }
          .company { text-align: center; width: 100%; }
          .company h2 { margin: 0; font-size: 15px; font-weight: bold; color: #004aad; }
          .company p { margin: 1px 0; font-size: 9px; }
          .photo-title { font-weight: bold; margin-bottom: 10px; font-size: 10px; }
          .photo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .photo-box { text-align: center; }
          .photo-label { font-size: 10px; font-weight: bold; margin-bottom: 6px; }
          .photo-box img { width: 100%; height: 165px; object-fit: cover; border-radius: 8px; border: 2px solid #004aad; }
          @media print { html, body { width: 210mm; height: 297mm; overflow: hidden; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">
            <h2>NPH ADIPURUSA</h2>
            <p>Container Inspection System</p>
          </div>
        </div>
        <div class="photo-title">FOTO INSPEKSI - ${item.container || "-"}</div>
        <div class="photo-grid">
          <div class="photo-box">
            <div class="photo-label">FOTO DAMAGE</div>
            ${item.photo2 ? `<img src="${item.photo2}" />` : ""}
          </div>
          ${parsePhotos(item.photo1)
            .map((url) => url.trim())
            .filter(Boolean)
            .map(
              (url, i) => `
                <div class="photo-box">
                  <div class="photo-label">FOTO CONTAINER/CDR ${i + 1}</div>
                  <img src="${url}" />
                </div>
              `
            )
            .join("")}
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 500); }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  }}
  title="Cetak Foto"
>
  <Image size={18} />
</button>


                          {(user?.username === "adminRAL" || user?.role !== "PETUGAS") && (
                            <button
                              className="edit-btn"
                              style={{ marginLeft: "8px" }}
                              onClick={() => setEditingInspection(item)}
                              title="Edit Inspeksi"
                            >
                              <Pencil size={18} />
                            </button>
                          )}

                          {user?.username === "adminRAL" && (
                            <button
                              className="delete-btn"
                              style={{ marginLeft: "8px" }}
                              onClick={() => handleDeleteInspection(item.id)}
                              title="Hapus Inspeksi"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {(() => {
            const filtered = (
              Array.isArray(historyData) ? historyData : []
            ).filter((item) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase().trim();
              return (
                (item.container || "").toLowerCase().includes(q) ||
                (item.shipName || "").toLowerCase().includes(q) ||
                (item.petugas || "").toLowerCase().includes(q) ||
                (item.group || "").toLowerCase().includes(q) ||
                (item.condition || "").toLowerCase().includes(q) ||
                (item.side || "").toLowerCase().includes(q)
              );
            });
            const totalPages = Math.ceil(filtered.length / 10);
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

        {/* PENGATURAN / SETTINGS SECTION */}
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
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      background: "white",
                    }}
                  >
                    <option value="">-Kondisi-</option>
                    <option value="GOOD">GOOD</option>
                    <option value="Bent/Bengkok">Bent/Bengkok</option>
                    <option value="Broken/Pecah">Broken/Pecah</option>
                    <option value="Hole/Berlubang">Hole/Berlubang</option>
                    <option value="Cut/Terpotong">Cut/Terpotong</option>
                    <option value="Dented/Penyok">Dented/Penyok</option>
                    <option value="Missing/Hilang">Missing/Hilang</option>
                    <option value="Scraped/Tergores">Scraped/Tergores</option>
                    <option value="Torn/Robek">Torn/Robek</option>
                    <option value="Leaking/Bocor">Leaking/Bocor</option>
                  </select>
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
                  <select
                    value={editSide}
                    onChange={(e) => setEditSide(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      background: "white",
                    }}
                  >
                    <option value="">-Sisi-</option>
                    <option value="Front/Depan">Front/Depan</option>
                    <option value="Bottom/Bawah">Bottom/Bawah</option>
                    <option value="Left Side/Sisi Kiri">
                      Left Side/Sisi Kiri
                    </option>
                    <option value="Right Side/Sisi Kanan">
                      Right Side/Sisi Kanan
                    </option>
                    <option value="Roof/Atas">Roof/Atas</option>
                    <option value="Rear/Belakang">Rear/Belakang</option>
                    <option value="Inside/Dalam">Inside/Dalam</option>
                  </select>
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
