import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, Search, UserCheck, Clock, Layers } from "lucide-react";
import API_URL from "../../config/api";

export default function UserManagement() {
  const [accounts, setAccounts] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("accounts")) || [
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
      ]
    );
  });

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newJabatan, setNewJabatan] = useState("PETUGAS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accounts`);
        const dbData = await response.json();
        if (Array.isArray(dbData)) {
          // Migrate local storage accounts that aren't in the database yet
          const localAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
          const missing = localAccounts.filter(local => 
            !dbData.some(db => db.username.toLowerCase().trim() === local.username.toLowerCase().trim())
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

    if (accounts.some(acc => acc.username.toLowerCase() === newUsername.trim().toLowerCase())) {
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

  const filteredAccounts = accounts.filter(acc =>
    (acc.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.group || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.jabatan || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="card-header-um">
            <UserPlus size={20} className="icon-blue" />
            <h4>Tambah Pengguna Baru</h4>
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
