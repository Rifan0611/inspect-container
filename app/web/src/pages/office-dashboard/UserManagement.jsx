import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, Search, UserCheck, Clock, Layers, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import API_URL from "../../config/api";

export default function UserManagement() {
  const [accounts, setAccounts] = useState(() => {
    const defaultAccounts = [
      {
        username: "manager",
        password: "123",
        jabatan: "MANAGER",
        nama: "Rian Agung",
        group: "Management",
      },
      {
        username: "supervisor",
        password: "123",
        jabatan: "SUPERVISOR",
        nama: "Budi Santoso",
        group: "Shift A",
      },
      {
        username: "assistant",
        password: "123",
        jabatan: "ASSISTANT SUPERVISOR",
        nama: "Andi Wijaya",
        group: "Shift B",
      },
      {
        username: "petugas",
        password: "123",
        jabatan: "PETUGAS",
        nama: "Petugas Lapangan",
        group: "Lapangan",
      },
      {
        username: "adminRAL",
        password: "Rifan0611",
        jabatan: "ADMIN",
        nama: "Admin NPH",
        group: "Office",
      },
    ];
    try {
      const stored = localStorage.getItem("accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing accounts from localStorage:", e);
    }
    return defaultAccounts;
  });

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newJabatan, setNewJabatan] = useState("PETUGAS");
  const [searchTerm, setSearchTerm] = useState("");

  // Excel import state
  const [activeTab, setActiveTab] = useState("manual"); // "manual" or "excel"
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [isSavingExcel, setIsSavingExcel] = useState(false);

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setExcelFileName(file.name);
    setExcelData([]);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binary = evt.target.result;
        const workbook = XLSX.read(binary, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        if (rawRows.length === 0) {
          setImportErrors(["File Excel tidak memiliki baris data atau kosong."]);
          return;
        }

        const parsedUsers = [];
        const errors = [];
        const currentAccounts = Array.isArray(accounts) ? accounts : [];

        rawRows.forEach((row, i) => {
          const rowNum = i + 2;

          let namaVal = "";
          let usernameVal = "";
          let passwordVal = "";
          let jabatanVal = "";
          let groupVal = "";

          Object.keys(row).forEach(key => {
            const normalizedKey = key.trim().toLowerCase();
            const val = String(row[key] || "").trim();

            if (normalizedKey === "nama lengkap" || normalizedKey === "nama" || normalizedKey === "name") {
              namaVal = val;
            } else if (normalizedKey === "username" || normalizedKey === "user") {
              usernameVal = val;
            } else if (normalizedKey === "password" || normalizedKey === "pass") {
              passwordVal = val;
            } else if (normalizedKey === "jabatan" || normalizedKey === "role" || normalizedKey === "otoritas") {
              jabatanVal = val.toUpperCase();
            } else if (normalizedKey === "group" || normalizedKey === "shift" || normalizedKey === "grup") {
              groupVal = val;
            }
          });

          if (!usernameVal) {
            errors.push(`Baris ${rowNum}: Username kosong`);
            return;
          }
          if (!passwordVal) {
            passwordVal = "123";
          }
          if (!namaVal) {
            namaVal = usernameVal;
          }
          if (!groupVal) {
            groupVal = "Office";
          }

          const validRoles = ["PETUGAS", "SUPERVISOR", "ASSISTANT SUPERVISOR", "MANAGER", "ADMIN"];
          if (!jabatanVal) {
            jabatanVal = "PETUGAS";
          } else {
            if (jabatanVal.includes("ASSISTANT") || jabatanVal.includes("ASST")) {
              jabatanVal = "ASSISTANT SUPERVISOR";
            } else if (jabatanVal.includes("SUPERVISOR") || jabatanVal.includes("SPV")) {
              jabatanVal = "SUPERVISOR";
            } else if (jabatanVal.includes("MANAGER") || jabatanVal.includes("MGR")) {
              jabatanVal = "MANAGER";
            } else if (jabatanVal.includes("ADMIN")) {
              jabatanVal = "ADMIN";
            } else {
              jabatanVal = "PETUGAS";
            }
          }

          if (parsedUsers.some(u => u.username.toLowerCase() === usernameVal.toLowerCase())) {
            errors.push(`Baris ${rowNum}: Username "${usernameVal}" duplikat di file Excel`);
            return;
          }

          if (currentAccounts.some(acc => acc && acc.username && acc.username.toLowerCase() === usernameVal.toLowerCase())) {
            errors.push(`Baris ${rowNum}: Username "${usernameVal}" sudah terdaftar di sistem`);
            return;
          }

          parsedUsers.push({
            username: usernameVal,
            password: passwordVal,
            jabatan: jabatanVal,
            nama: namaVal,
            group: groupVal
          });
        });

        setExcelData(parsedUsers);
        setImportErrors(errors);

      } catch (err) {
        console.error(err);
        setImportErrors(["Gagal membaca file Excel. Pastikan format file sesuai."]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveExcelData = async () => {
    if (excelData.length === 0) {
      alert("Tidak ada data akun yang valid untuk disimpan.");
      return;
    }

    setIsSavingExcel(true);

    try {
      const res = await fetch(`${API_URL}/api/accounts/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(excelData)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyimpan data massal.");
      }

      const currentAccounts = Array.isArray(accounts) ? accounts : [];
      const updated = [...currentAccounts, ...excelData];
      setAccounts(updated);
      localStorage.setItem("accounts", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));

      alert(`Sukses! ${excelData.length} user berhasil ditambahkan!`);
      setExcelFile(null);
      setExcelFileName("");
      setExcelData([]);
      setImportErrors([]);
      setActiveTab("manual");

    } catch (err) {
      console.warn("Backend bulk insert failed, attempting sequential / offline creation:", err);
      
      let successCount = 0;
      const failed = [];
      const currentAccounts = Array.isArray(accounts) ? [...accounts] : [];

      for (const user of excelData) {
        try {
          const res = await fetch(`${API_URL}/api/accounts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
          });
          if (res.ok) {
            currentAccounts.push(user);
            successCount++;
          } else {
            failed.push(user.username);
          }
        } catch (e) {
          currentAccounts.push(user);
          successCount++;
        }
      }

      setAccounts(currentAccounts);
      localStorage.setItem("accounts", JSON.stringify(currentAccounts));
      window.dispatchEvent(new Event("storage"));

      if (failed.length > 0) {
        alert(`Berhasil menambahkan ${successCount} user. Gagal menambahkan: ${failed.join(", ")}`);
      } else {
        alert(`Sukses! ${successCount} user berhasil ditambahkan secara lokal/offline!`);
      }

      setExcelFile(null);
      setExcelFileName("");
      setExcelData([]);
      setImportErrors([]);
      setActiveTab("manual");
    } finally {
      setIsSavingExcel(false);
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accounts`);
        const dbData = await response.json();
        if (Array.isArray(dbData)) {
          // Migrate local storage accounts that aren't in the database yet
          let localAccounts = [];
          try {
            const stored = localStorage.getItem("accounts");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) {
                localAccounts = parsed;
              }
            }
          } catch (e) {
            console.error("Error reading local accounts in migration:", e);
          }
          const missing = localAccounts.filter(local => 
            local && local.username && !dbData.some(db => db && db.username && db.username.toLowerCase().trim() === local.username.toLowerCase().trim())
          );
          
          if (missing.length > 0) {
            console.log("Migrating local accounts to MySQL (dashboard):", missing);
            for (const acc of missing) {
              try {
                await fetch(`${API_URL}/api/accounts`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    username: acc.username,
                    password: acc.password,
                    jabatan: acc.jabatan,
                    nama: acc.nama || acc.username,
                    group: acc.group || "Office"
                  })
                });
              } catch (e) {
                console.error("Migration error for", acc.username, e);
              }
            }
            // Refetch after migrating
            const refetchRes = await fetch(`${API_URL}/api/accounts`);
            const refetchData = await refetchRes.json();
            if (Array.isArray(refetchData)) {
              setAccounts(refetchData);
              localStorage.setItem("accounts", JSON.stringify(refetchData));
              return;
            }
          }
          
          setAccounts(dbData);
          localStorage.setItem("accounts", JSON.stringify(dbData));
        }
      } catch (err) {
        console.error("Failed to load accounts from database", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newNama.trim() || !newGroup.trim()) {
      alert("Harap lengkapi semua input data!");
      return;
    }

    const currentAccounts = Array.isArray(accounts) ? accounts : [];
    if (currentAccounts.some(acc => acc && acc.username && acc.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert("Username sudah terdaftar!");
      return;
    }

    const newUser = {
      username: newUsername.trim(),
      password: newPassword.trim(),
      jabatan: newJabatan,
      nama: newNama.trim(),
      group: newGroup.trim(),
    };

    fetch(`${API_URL}/api/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    })
    .then(async (res) => {
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal membuat akun");
      }
      const updated = [...accounts, newUser];
      setAccounts(updated);
      localStorage.setItem("accounts", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      alert("User berhasil ditambahkan!");
      setNewUsername("");
      setNewPassword("");
      setNewNama("");
      setNewGroup("");
    })
    .catch((err) => {
      console.warn("Backend offline, saving locally:", err);
      const updated = [...accounts, newUser];
      setAccounts(updated);
      localStorage.setItem("accounts", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      alert("User berhasil ditambahkan secara lokal (offline)!");
      setNewUsername("");
      setNewPassword("");
      setNewNama("");
      setNewGroup("");
    });
  };

  const handleDeleteUser = (usernameToDelete) => {
    if (usernameToDelete === "adminRAL") {
      alert("User admin utama tidak dapat dihapus!");
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus user ${usernameToDelete}?`)) {
      fetch(`${API_URL}/api/accounts/${usernameToDelete}`, {
        method: "DELETE"
      })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Gagal menghapus akun");
        }
        const updated = accounts.filter(acc => acc.username !== usernameToDelete);
        setAccounts(updated);
        localStorage.setItem("accounts", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
      })
      .catch((err) => {
        console.warn("Backend offline, deleting locally:", err);
        const updated = accounts.filter(acc => acc.username !== usernameToDelete);
        setAccounts(updated);
        localStorage.setItem("accounts", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
        alert("User berhasil dihapus secara lokal (offline)!");
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "MANAGER":
        return "role-manager";
      case "SUPERVISOR":
        return "role-supervisor";
      case "ASSISTANT SUPERVISOR":
        return "role-assistant";
      case "ADMIN":
        return "role-manager"; // Admin uses managers styling or red
      default:
        return "role-petugas";
    }
  };

  const filteredAccounts = (Array.isArray(accounts) ? accounts : []).filter(acc =>
    acc && (
      (acc.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.group || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.jabatan || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="user-management-container">
      <div className="um-header">
        <h3 className="section-title">Manajemen Akun Pengguna</h3>
        <p className="section-subtitle">Tambah, pantau, dan kelola otorisasi akun serta shift petugas lapangan dan manajemen office.</p>
      </div>

      <div className="um-grid">
        {/* FORM TAMBAH USER */}
        <div className="um-card form-card-new">
          <div className="um-tabs">
            <button
              type="button"
              className={`um-tab-btn ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              <UserPlus size={16} />
              <span>Manual</span>
            </button>
            <button
              type="button"
              className={`um-tab-btn ${activeTab === "excel" ? "active" : ""}`}
              onClick={() => setActiveTab("excel")}
            >
              <FileSpreadsheet size={16} />
              <span>Import Excel</span>
            </button>
          </div>

          {activeTab === "manual" ? (
            <div style={{ marginTop: "12px" }}>
              <div className="card-header-um" style={{ borderBottom: "none", paddingBottom: 0, marginTop: "8px", marginBottom: "12px" }}>
                <UserPlus size={18} className="icon-blue" />
                <h4 style={{ fontSize: "16px" }}>Tambah Pengguna Baru</h4>
              </div>
              <form onSubmit={handleAddUser} className="um-form">
                <div className="form-group-um">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rian Agung..."
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="input-um"
                    required
                  />
                </div>
                <div className="form-group-um">
                  <label>Username (Login)</label>
                  <input
                    type="text"
                    placeholder="Contoh: manager2..."
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input-um"
                    required
                  />
                </div>
                <div className="form-group-um">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Masukkan password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-um"
                    required
                  />
                </div>
                <div className="form-group-um">
                  <label>Nama Group</label>
                  <input
                    type="text"
                    placeholder="Contoh: Shift A, Lapangan, Office..."
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="input-um"
                    required
                  />
                </div>
                <div className="form-group-um">
                  <label>Jabatan / Otoritas</label>
                  <select
                    value={newJabatan}
                    onChange={(e) => setNewJabatan(e.target.value)}
                    className="select-um"
                  >
                    <option value="PETUGAS">PETUGAS LAPANGAN</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="ASSISTANT SUPERVISOR">ASSISTANT SUPERVISOR</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <button type="submit" className="btn-add-user">
                  Buat Akun
                </button>
              </form>
            </div>
          ) : (
            <div className="um-excel-import" style={{ marginTop: "12px" }}>
              <div className="card-header-um" style={{ borderBottom: "none", paddingBottom: 0, marginTop: "8px", marginBottom: "12px" }}>
                <FileSpreadsheet size={18} className="icon-blue" />
                <h4 style={{ fontSize: "16px" }}>Import via Excel</h4>
              </div>

              <div className="form-group-um">
                <label>File Excel (.xlsx, .xls)</label>
                <div className="excel-upload-zone">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelImport}
                    id="excel-file-input"
                    className="excel-hidden-input"
                  />
                  <label htmlFor="excel-file-input" className="excel-upload-label">
                    <Upload size={20} className="icon-blue" />
                    <span>{excelFileName || "Pilih File Excel"}</span>
                  </label>
                </div>
              </div>

              {importErrors.length > 0 && (
                <div className="excel-errors">
                  <div className="error-title">
                    <AlertCircle size={14} />
                    <span>Ada Error di File Excel:</span>
                  </div>
                  <ul>
                    {importErrors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importErrors.length > 3 && <li>...dan {importErrors.length - 3} error lainnya</li>}
                  </ul>
                </div>
              )}

              {excelData.length > 0 && (
                <div className="excel-preview-section">
                  <div className="preview-header">
                    <CheckCircle2 size={14} className="icon-green" />
                    <span>Pratinjau ({excelData.length} akun valid):</span>
                  </div>
                  <div className="excel-preview-list">
                    {excelData.slice(0, 5).map((u, idx) => (
                      <div className="preview-row" key={idx}>
                        <div className="preview-user-info">
                          <span className="preview-name">{u.nama}</span>
                          <span className="preview-sub">@{u.username}</span>
                        </div>
                        <div className="preview-badges">
                          <span className={`preview-badge badge-${u.jabatan.toLowerCase().replace(" ", "-")}`}>
                            {u.jabatan === "PETUGAS" ? "PETUGAS" : u.jabatan}
                          </span>
                        </div>
                      </div>
                    ))}
                    {excelData.length > 5 && (
                      <div className="preview-more-text">
                        ...dan {excelData.length - 5} akun lainnya
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveExcelData}
                    disabled={isSavingExcel}
                    className="btn-add-user btn-save-excel"
                  >
                    {isSavingExcel ? "Menyimpan..." : `Simpan ${excelData.length} Akun`}
                  </button>
                </div>
              )}

              <div className="excel-template-info">
                <h5>Format Kolom Excel yang Dibaca:</h5>
                <ul>
                  <li><strong>Nama</strong> atau <strong>Nama Lengkap</strong></li>
                  <li><strong>Username</strong></li>
                  <li><strong>Password</strong></li>
                  <li><strong>Jabatan</strong> (PETUGAS, SUPERVISOR, MANAGER, ADMIN)</li>
                  <li><strong>Group</strong> (Shift A, Lapangan, Office)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* LIST PENGGUNA */}
        <div className="um-card list-card-new">
          <div className="card-header-um list-header">
            <div className="header-left">
              <UserCheck size={20} className="icon-green" />
              <h4>Daftar Pengguna Aktif</h4>
            </div>
            <div className="um-search">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama, group, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-um"
              />
            </div>
          </div>

          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Nama & Username</th>
                  <th>Jabatan</th>
                  <th>Group</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((item, index) => (
                  <tr key={index}>
                    <td className="username-cell">
                      <div className="user-avatar">
                        {(item.nama || item.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="username-text">{item.nama || "Tanpa Nama"}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>@{item.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeColor(item.jabatan)}`}>
                        {item.jabatan === "PETUGAS" ? "PETUGAS LAPANGAN" : item.jabatan}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569" }}>
                        <Layers size={14} style={{ color: "#8b5cf6" }} />
                        <span>{item.group || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-delete-user"
                        onClick={() => handleDeleteUser(item.username)}
                        title="Hapus Pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
