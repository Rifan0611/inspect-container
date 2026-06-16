// ========================================
// FILE : src/pages/Dashboard.jsx
// ========================================

import { useNavigate } from "react-router-dom";

export default function Dashboard(){

const navigate =
useNavigate();

const user =
JSON.parse(
localStorage.getItem(
"user"
)
);

const role =
user?.role || "PETUGAS";

const displayRole = role === "PETUGAS" ? "PETUGAS LAPANGAN" : role;

const logout = ()=>{

localStorage.removeItem(
"user"
);

navigate("/");

};

return(

<div
style={{
minHeight:"100vh",
padding:20,
background:
"linear-gradient(to bottom,#0057b8,#ff9900)"
}}
>

<div
style={{
background:"#fff",
padding:30,
borderRadius:35,
maxWidth:700,
margin:"auto"
}}
>

<svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 24px auto", display: "block" }}>
  <path d="M32 6 L54 17 L32 28 L10 17 Z" fill="url(#topGradDash)" stroke="#004aad" strokeWidth="1" />
  <path d="M10 17 L32 28 L32 54 L10 43 Z" fill="url(#leftGradDash)" />
  <path d="M32 28 L54 17 L54 43 L32 54 Z" fill="url(#rightGradDash)" />
  <path d="M15 20.5 L15 45.5 M20 23 L20 48 M25 25.5 L25 50.5 M30 28 L30 53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
  <path d="M37 52.5 L37 27.5 M42 50 L42 25 M47 47.5 L47 22.5 M52 45 L52 20" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
  <path d="M10 17 L32 28 L54 17 M32 28 L32 54" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  <path d="M10 17 L10 43 L32 54 L54 43 L54 17 M32 6 L54 17 L32 28 L10 17 Z" stroke="#00357a" strokeWidth="1.5" strokeLinejoin="round" />
  <defs>
    <linearGradient id="topGradDash" x1="10" y1="17" x2="54" y2="17" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#2563eb" />
      <stop offset="100%" stopColor="#004aad" />
    </linearGradient>
    <linearGradient id="leftGradDash" x1="10" y1="17" x2="32" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#0b2c63" />
      <stop offset="100%" stopColor="#00183b" />
    </linearGradient>
    <linearGradient id="rightGradDash" x1="32" y1="28" x2="54" y2="43" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#ff9f43" />
      <stop offset="100%" stopColor="#ff7a00" />
    </linearGradient>
  </defs>
</svg>

<h1
style={{
textAlign:"center",
color:"#004aad",
marginTop:20
}}
>
DASHBOARD
</h1>

<h2
style={{
textAlign:"center"
}}
>
{displayRole}
</h2>

<button
onClick={()=>
navigate("/inspection")
}
style={button}
>
CONTAINER INSPECTION
</button>

<button
onClick={()=>
navigate("/history")
}
style={button}
>
RIWAYAT INSPEKSI
</button>

{

(role==="MANAGER" ||

role==="SUPERVISOR" ||

role==="DIREKSI" ||

role==="FORMAN" ||

role==="ADM")

&&

<button
onClick={()=>
navigate("/report")
}
style={button}
>
EXPORT PDF
</button>

}

<button
onClick={()=>
navigate("/settings")
}
style={button}
>
PENGATURAN AKUN
</button>

{/* TABEL TRANSAKSI TERBARU */}
<div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "25px", marginBottom: "20px" }}>
  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#004aad", marginBottom: "15px", textAlign: "left" }}>
    Transaksi Inspeksi Terbaru
  </h3>
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
      <thead>
        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
          <th style={{ padding: "10px 8px", color: "#64748b", fontWeight: "600" }}>No</th>
          <th style={{ padding: "10px 8px", color: "#64748b", fontWeight: "600" }}>Container</th>
          <th style={{ padding: "10px 8px", color: "#64748b", fontWeight: "600" }}>Kapal</th>
          <th style={{ padding: "10px 8px", color: "#64748b", fontWeight: "600" }}>Kondisi</th>
          <th style={{ padding: "10px 8px", color: "#64748b", fontWeight: "600" }}>Sisi</th>
        </tr>
      </thead>
      <tbody>
        {(JSON.parse(localStorage.getItem("history")) || []).slice(0, 5).map((item, index) => (
          <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "10px 8px", color: "#334155" }}>{index + 1}</td>
            <td style={{ padding: "10px 8px", fontWeight: "700", color: "#2563eb" }}>{item.container}</td>
            <td style={{ padding: "10px 8px", color: "#334155" }}>{item.shipName}</td>
            <td style={{ padding: "10px 8px" }}>
              <span style={{
                padding: "3px 6px",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: "700",
                background: item.condition === "Good" || item.condition === "GOOD" ? "#dcfce7" : "#ffe4e6",
                color: item.condition === "Good" || item.condition === "GOOD" ? "#15803d" : "#b91c1c"
              }}>
                {item.condition}
              </span>
            </td>
            <td style={{ padding: "10px 8px", color: "#475569" }}>{item.side || "General"}</td>
          </tr>
        ))}
        {(JSON.parse(localStorage.getItem("history")) || []).length === 0 && (
          <tr>
            <td colSpan="5" style={{ padding: "20px 8px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
              Belum ada riwayat transaksi inspeksi.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

<button
onClick={logout}
style={{
...button,
background:"red"
}}
>
LOGOUT
</button>

</div>

</div>

)

}

const button = {

width:"100%",
padding:20,
marginTop:20,
border:"none",
borderRadius:20,
background:"#ff7a00",
color:"#fff",
fontSize:20,
fontWeight:"bold"

};