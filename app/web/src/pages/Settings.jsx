// ========================================
// FILE : src/pages/Settings.jsx
// ========================================

import { useState } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../config/api";

export default function Settings({ onBack }){
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      alert("Password tidak boleh kosong!");
      return;
    }
    if (!user || !user.username) {
      alert("Sesi login tidak valid. Silakan login kembali.");
      if (onBack) onBack();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/accounts/${user.username}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah password");
      }
      
      // Update local storage user password as well
      const updatedUser = { ...user, password: newPassword.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Password berhasil diubah!");
      setNewPassword("");
      if (onBack) onBack(); // Redirect back to dashboard
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return(
    <div style={{ minHeight:"100vh", display:"flex", justifyContent:"center", alignItems:"center", background: "linear-gradient(to bottom,#0057b8,#ff9900)" }}>
      <div style={{ background:"#fff", padding:35, borderRadius:35, width:"90%", maxWidth:500 }}>
        <h1 style={{ textAlign:"center", color:"#004aad", marginBottom: "10px" }}>PENGATURAN AKUN</h1>
        <h3 style={{ textAlign:"center", color:"#334155", marginBottom: "20px", fontWeight: "normal", fontSize: "16px" }}>
          Ganti password untuk: <strong>{user?.username || "-"}</strong>
        </h3>
        
        <div style={{ position: "relative", width: "100%", marginTop: 10 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan Password Baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width:"100%", padding:18, paddingRight: 50, borderRadius:18, border:"1px solid #ccc", fontSize:18 }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 15,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 5
            }}
          >
            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
        
        <button
          onClick={handleUpdatePassword}
          disabled={isLoading}
          style={{ width:"100%", padding:18, marginTop:25, border:"none", borderRadius:20, background: isLoading ? "#ccc" : "#ff7a00", color:"#fff", fontSize:20, fontWeight:"bold", cursor: isLoading ? "not-allowed" : "pointer" }}
        >
          {isLoading ? "MENYIMPAN..." : "SIMPAN PASSWORD BARU"}
        </button>
        
        <button
          onClick={() => { if (onBack) onBack(); }}
          style={{ width:"100%", padding:18, marginTop:15, border:"none", borderRadius:20, background:"#e2e8f0", color:"#334155", fontSize:18, fontWeight:"bold", cursor:"pointer" }}
        >
          KEMBALI
        </button>
      </div>
    </div>
  );
}