import OfficeDashboard from "./pages/office-dashboard/OfficeDashboard";
import API_URL from "./config/api";
import React,{useState} from "react";

import * as XLSX from "xlsx";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell
} from "recharts";

const compressImageToBase64 = (file, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(dataUrl);
    };
    img.onerror = () => {
      callback(event.target.result);
    };
  };
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#fee2e2", color: "#991b1b", minHeight: "100vh", fontFamily: "monospace" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Aplikasi Error (Crash)</h2>
          <p style={{ fontWeight: "bold" }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: "20px", background: "#fff", padding: "15px", borderRadius: "8px", overflowX: "auto", fontSize: "12px", border: "1px solid #fca5a5" }}>
            {this.state.error && this.state.error.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: "20px", padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            Reload Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(){

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

// ======================================================
// STATE
// ======================================================

const [page,setPage] =
useState("login");

const [username,setUsername] =
useState("");

const [password,setPassword] =
useState("");

const [role,setRole] =
useState("");

const [manifestShipName,setManifestShipName] =
useState("");

const [manifestData,setManifestData] =
useState(

JSON.parse(
localStorage.getItem(
"manifestData"
)
) || []

);

const [container,setContainer] =
useState("");

const [shipName,setShipName] =
useState("");

const [status,setStatus] =
useState("");

const [iso,setIso] =
useState("");

const [category,setCategory] =
useState("");

const [photo1,setPhoto1] =
useState("");

const [photo2,setPhoto2] =
useState("");

const [search,setSearch] =
useState("");

const [condition,setCondition] =
useState("");

const [side,setSide] =
useState("");

const [note,setNote] =
useState("");

const [history,setHistory] =
useState(
JSON.parse(
localStorage.getItem("history")
) || []
);

// ======================================================
// USER MANAGEMENT
// ======================================================

const users = [

{
name:"Andi Saputra",
role:"MANAGER",
group:"Management",
status:"Online"
},

{
name:"Budi Santoso",
role:"SUPERVISOR",
group:"Shift A",
status:"Online"
},

{
name:"Rizky Hidayat",
role:"ASSISTANT SUPERVISOR",
group:"Shift B",
status:"Online"
},

{
name:"Doni Pratama",
role:"PETUGAS",
group:"Lapangan A",
status:"Online"
},

{
name:"Fajar Nugraha",
role:"PETUGAS",
group:"Lapangan B",
status:"Offline"
},

{
name:"Yusuf Maulana",
role:"PETUGAS",
group:"Gate In",
status:"Online"
}

];

const grafikData = [

{tanggal:"01/05",total:40},
{tanggal:"05/05",total:70},
{tanggal:"10/05",total:50},
{tanggal:"15/05",total:90},
{tanggal:"20/05",total:65},
{tanggal:"24/05",total:80}

];

const pieData = [

{name:"Dented",value:38},
{name:"Bent",value:22},
{name:"Broken",value:12},
{name:"Hole",value:8},
{name:"Others",value:20}

];

const pieColors = [
"#2F80ED",
"#EB5757",
"#F2C94C",
"#27AE60",
"#BDBDBD"
];

// ======================================================
// LOGIN
// ======================================================

const [user,setUser] =
useState(null);

React.useEffect(() => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}, [user]);

React.useEffect(() => {
  const fetchAndMigrateInspections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inspection`);
      const dbInspections = await response.json();
      
      if (Array.isArray(dbInspections)) {
        const localHistory = JSON.parse(localStorage.getItem("history")) || [];
        
        // Find inspections in local storage that are NOT in the database
        const missingInDb = localHistory.filter(localIns => 
          !dbInspections.some(dbIns => 
            String(dbIns.container).toUpperCase().trim() === String(localIns.container).toUpperCase().trim() &&
            Math.abs(new Date(dbIns.date).getTime() - new Date(localIns.date).getTime()) < 5000
          )
        );
        
        if (missingInDb.length > 0) {
          console.log("Migrating local inspections to database:", missingInDb);
          for (const ins of missingInDb) {
            try {
              await fetch(`${API_URL}/api/inspection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ins)
              });
            } catch (e) {
              console.error("Failed to migrate inspection:", ins.container, e);
            }
          }
          
          // Re-fetch updated list from DB after migration
          const updatedResponse = await fetch(`${API_URL}/api/inspection`);
          const updatedDbInspections = await updatedResponse.json();
          if (Array.isArray(updatedDbInspections)) {
            setHistory(updatedDbInspections);
            localStorage.setItem("history", JSON.stringify(updatedDbInspections));
            return;
          }
        }
        
        setHistory(dbInspections);
        localStorage.setItem("history", JSON.stringify(dbInspections));
      }
    } catch (err) {
      console.error("Failed to sync inspections with database:", err);
    }
  };
  
  fetchAndMigrateInspections();
}, []);

const login = async ()=>{
  const currentHour = new Date().getHours();
  const activeShift = currentHour >= 8 && currentHour < 20 ? "PAGI" : "MALAM";

  // Fetch latest accounts from backend database so mobile/remote logins work immediately
  let storedAccounts = [];
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
        console.log("Migrating local accounts to MySQL:", missing);
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
          storedAccounts = refetchData;
          localStorage.setItem("accounts", JSON.stringify(refetchData));
        } else {
          storedAccounts = dbData;
          localStorage.setItem("accounts", JSON.stringify(dbData));
        }
      } else {
        storedAccounts = dbData;
        localStorage.setItem("accounts", JSON.stringify(dbData));
      }
    } else {
      storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    }
  } catch (err) {
    console.error("Failed to fetch latest accounts, using cache:", err);
    storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
  }

  // MANAGER
  if(
    username==="manager" &&
    password==="123"
  ){
    const dataUser = {
      nama:"Rian Agung",
      role:"MANAGER",
      username:"manager",
      shift: activeShift,
      group:"Management"
    };

    setUser(dataUser);
    setRole("MANAGER");
    setPage("office-dashboard");
    return;
  }

  // SUPERVISOR
  if(
    username==="supervisor" &&
    password==="123"
  ){
    const dataUser = {
      nama:"Budi Santoso",
      role:"SUPERVISOR",
      username:"supervisor",
      shift: activeShift,
      group:"Shift A"
    };

    setUser(dataUser);
    setRole("SUPERVISOR");
    setPage("office-dashboard");
    return;
  }

  // ASSISTANT
  if(
    username==="assistant" &&
    password==="123"
  ){
    const dataUser = {
      nama:"Andi Wijaya",
      role:"ASSISTANT SUPERVISOR",
      username:"assistant",
      shift: activeShift,
      group:"Shift B"
    };

    setUser(dataUser);
    setRole("ASSISTANT SUPERVISOR");
    setPage("office-dashboard");
    return;
  }

  // ADMIN
  if(
    username==="adminRAL" &&
    password==="Rifan0611"
  ){
    const dataUser = {
      nama:"Admin NPH",
      role:"ADMIN",
      username:"adminRAL",
      shift: activeShift,
      group:"Office"
    };

    setUser(dataUser);
    setRole("ADMIN");
    setPage("office-dashboard");
    return;
  }

  // PETUGAS
  if(
    username==="petugas" &&
    password==="123"
  ){
    const dataUser = {
      nama:"Petugas Lapangan",
      role:"PETUGAS",
      username:"petugas",
      shift: activeShift,
      group:"Lapangan"
    };

    setUser(dataUser);
    setRole("PETUGAS");
    setPage("dashboard");
    return;
  }

  // CHECK DYNAMIC ACCOUNTS FROM DATABASE / CACHE
  const matchedAccount = storedAccounts.find(
    (acc) => acc.username.toLowerCase().trim() === username.toLowerCase().trim() && acc.password === password
  );

  if (matchedAccount) {
    const dataUser = {
      nama: matchedAccount.nama || matchedAccount.username,
      role: matchedAccount.jabatan,
      username: matchedAccount.username,
      shift: activeShift,
      group: matchedAccount.group || "Office"
    };

    setUser(dataUser);
    setRole(matchedAccount.jabatan);

    if (matchedAccount.jabatan === "PETUGAS") {
      setPage("dashboard");
    } else {
      setPage("office-dashboard");
    }
    return;
  }

  alert("USERNAME / PASSWORD SALAH");
};

// ======================================================
// IMPORT MANIFEST
// ======================================================

const importExcel = (e)=>{

const file =
e.target.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload = (evt)=>{

const dataBuffer =
evt.target.result;

const workbook =
XLSX.read(dataBuffer,{
type:"array"
});

const sheetName =
workbook.SheetNames[0];

const worksheet =
workbook.Sheets[sheetName];

const data =
XLSX.utils.sheet_to_json(
worksheet
);

const finalData =
data.map((item)=>({

...item,

shipName:
manifestShipName

}));

setManifestData(finalData);

localStorage.setItem(
"manifestData",
JSON.stringify(finalData)
);

alert(
"MANIFEST BERHASIL IMPORT"
);

};

reader.readAsArrayBuffer(file);

};

// ======================================================
// AUTO CARI CONTAINER
// ======================================================

const cariContainer = (value)=>{

const upperValue =
value.toUpperCase();

setContainer(upperValue);

const found =
manifestData.find((item)=>{

const nomorContainer =
String(

item["CONTAINER"] ||
item["Container"] ||
item["NO CONTAINER"] ||
item["NOMOR CONTAINER"] ||
item["container"] ||
""

).toUpperCase();

return (
nomorContainer ===
upperValue
);

});

if(found){

setShipName(

found.shipName ||

found["VESSEL"] ||

found["KAPAL"] ||

found["SHIP"] ||

found["Carrier"] ||

""

);

setStatus(

found.status ||
found["STATUS"] ||
found["FULL/EMPTY"] ||
found["FULL EMPTY"] ||
""

);

setIso(

found.iso ||
found["ISO"] ||
found["ISO CODE"] ||
""

);

setCategory(

found.category ||
found["CATEGORY"] ||
found["TYPE"] ||
""

);

}else{

setShipName("");
setStatus("");
setIso("");
setCategory("");

}

};

  const cariContainerLive = async () => {
    if (!container.trim()) {
      alert("Harap masukkan nomor container terlebih dahulu!");
      return;
    }

    const value = container.toUpperCase().trim();
    try {
      const response = await fetch(`${API_URL}/api/manifest`);
      const data = await response.json();
      
      setManifestData(data);
      localStorage.setItem("manifestData", JSON.stringify(data));

      const found = data.find((item) => {
        const nomorContainer = String(
          item.container ||
          item["CONTAINER"] ||
          item["Container"] ||
          item["NO CONTAINER"] ||
          item["NOMOR CONTAINER"] ||
          ""
        ).toUpperCase().trim();
        return nomorContainer === value;
      });

      if (found) {
        setShipName(
          found.shipName ||
          found["VESSEL"] ||
          found["KAPAL"] ||
          found["SHIP"] ||
          found["Carrier"] ||
          ""
        );
        setStatus(
          found.status ||
          found["STATUS"] ||
          found["FULL/EMPTY"] ||
          found["FULL EMPTY"] ||
          ""
        );
        setIso(
          found.iso ||
          found["ISO"] ||
          found["ISO CODE"] ||
          ""
        );
        setCategory(
          found.category ||
          found["CATEGORY"] ||
          found["TYPE"] ||
          ""
        );
        alert("Data container ditemukan!");
      } else {
        setShipName("");
        setStatus("");
        setIso("");
        setCategory("");
        alert("Nomor container tidak ditemukan di manifest. Harap pastikan manifest sudah di-import di dashboard.");
      }
    } catch (err) {
      console.error("ERROR SEARCHING CONTAINER", err);
      alert("Gagal mengambil data manifest terbaru dari server.");
    }
  };

// ======================================================
// SAVE DATA
// ======================================================

const simpanData = ()=>{
  if (!container.trim() || !shipName.trim() || !condition.trim()) {
    alert("Harap isi data nomor container, nama kapal, dan kondisi inspeksi!");
    return;
  }

  const data = {
    container: container.toUpperCase().trim(),
    shipName,
    status,
    iso,
    category,
    condition,
    side,
    note,
    photo1,
    photo2,
    petugas: user?.nama || "Petugas Lapangan",
    group: user?.group || "",
    date: new Date()
  };

  fetch(`${API_URL}/api/inspection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(async (res) => {
    let resData;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      resData = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Server error (${res.status}): ${text.substring(0, 100)}`);
    }
    
    if (!res.ok) {
      throw new Error(resData?.error || `Gagal menyimpan inspeksi ke server (${res.status})`);
    }
    
    const newHistory = [data, ...history];
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("focus"));

    alert("DATA INSPEKSI TERSIMPAN");
    
    setContainer("");
    setShipName("");
    setStatus("");
    setIso("");
    setCategory("");
    setCondition("");
    setSide("");
    setNote("");
    setPhoto1("");
    setPhoto2("");
  })
  .catch((err) => {
    console.error("Save error:", err);
    alert("Error: " + err.message + ". Menyimpan secara lokal di browser sementara offline.");
    
    const newHistory = [data, ...history];
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("focus"));
    
    setContainer("");
    setShipName("");
    setStatus("");
    setIso("");
    setCategory("");
    setCondition("");
    setSide("");
    setNote("");
    setPhoto1("");
    setPhoto2("");
  });
};

// ======================================================
// CETAK PDF
// ======================================================

const cetakPdf = (item)=>{

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

<script>

window.onload = function(){

window.print();

}

</script>

</body>

</html>

`);

win.document.close();

};

// ======================================================
// LOGIN PAGE
// ======================================================

if(page==="login"){

return(

<div style={bg}>

<div style={card}>

<img
src="/logo.png"
alt=""
style={logo}
/>

<h1 style={title}>
CONTAINER INSPECTION
</h1>

<input
placeholder="Username"
value={username}
onChange={(e)=>
setUsername(
e.target.value
)
}
style={input}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)
}
style={input}
/>

<button
style={button}
onClick={login}
>
LOGIN
</button>

</div>

</div>

);

}

// ======================================================
// DASHBOARD
// ======================================================

if(page==="dashboard"){

return(

<div style={bg}>

<div style={card}>

<img
src="/logo.png"
alt=""
style={logo}
/>

<h1 style={title}>
DASHBOARD
</h1>

<h2 style={roleText}>
{role === "PETUGAS" ? "PETUGAS LAPANGAN" : role}
</h2>

<button
style={button}
onClick={()=>
setPage("inspection")
}
>
CONTAINER INSPECTION
</button>

<button
style={button}
onClick={()=>
setPage("history")
}
>
RIWAYAT INSPEKSI
</button>

{
  role === "MANAGER" && (
    <>
      <button
        style={button}
        onClick={() => setPage("manager")}
      >
        MANAGER CONTROL ROOM
      </button>

      <button
        style={{ ...button, background: "#0B1F3A" }}
        onClick={() => setPage("office-dashboard")}
      >
        DASHBOARD KANTOR
      </button>
    </>
  )
}

{

role!=="PETUGAS"

&&

<div>

<input
placeholder="Nama Kapal"
value={manifestShipName}
onChange={(e)=>
setManifestShipName(
e.target.value
)
}
style={input}
/>

<input
type="file"
accept=".xlsx,.xls"
onChange={importExcel}
style={input}
/>

</div>

}

<button
style={logoutButton}
onClick={()=>
setPage("login")
}
>
LOGOUT
</button>

</div>

</div>

);

}

// ======================================================
// INSPECTION PAGE
// ======================================================

if(page==="inspection"){

const kerusakan = [

  "GOOD",
  "Bent/Bengkok",
  "Broken/Pecah",
  "Hole/Berlubang",
  "Cut/Terpotong",
  "Dented/Penyok",
  "Missing/Hilang",
  "Scraped/Tergores",
  "Torn/Robek",
  "Leaking/Bocor"

];

const sisi = [

  "Front/Depan",
  "Bottom/Bawah",
  "Left Side/Sisi Kiri",
  "Right Side/Sisi Kanan",
  "Roof/Atas",
  "Rear/Belakang"

];

return(

<div style={bg}>

  <div style={card}>

    <h1 style={title}>
      CONTAINER INSPECTION
    </h1>

    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <input
        placeholder="Nomor Container"
        value={container}
        onChange={(e)=>
          cariContainer(
            e.target.value.toUpperCase()
          )
        }
        style={{
          width: "100%",
          padding: "18px",
          borderRadius: "18px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />
      <button
        type="button"
        onClick={cariContainerLive}
        style={{
          padding: "0 24px",
          background: "#27AE60",
          color: "white",
          border: "none",
          borderRadius: "18px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}
      >
        Input
      </button>
    </div>

    <input
      placeholder="Nama Kapal"
      value={shipName}
      readOnly
      style={input}
    />

    <input
      placeholder="FULL / EMPTY"
      value={status}
      readOnly
      style={input}
    />

    <input
      placeholder="ISO CODE"
      value={iso}
      readOnly
      style={input}
    />

    <input
      placeholder="CATEGORY"
      value={category}
      readOnly
      style={input}
    />

    <select
      style={input}
      value={condition}
      onChange={(e)=>
        setCondition(
          e.target.value
        )
      }
    >

      <option>
        -Kondisi-
      </option>

      {
        kerusakan.map((item,index)=>(

          <option key={index}>
            {item}
          </option>

        ))
      }

    </select>

    <select
      style={input}
      value={side}
      onChange={(e)=>
        setSide(
          e.target.value
        )
      }
    >

      <option>
        -Sisi-
      </option>

      {
        sisi.map((item,index)=>(

          <option key={index}>
            {item}
          </option>

        ))
      }

    </select>

    <textarea
      placeholder="CATATAN KRONOLOGI"
      value={note}
      onChange={(e)=>
        setNote(
          e.target.value
        )
      }
      style={textarea}
    />
{/* FOTO CONTAINER */}

<div
  style={{
    marginBottom:"25px"
  }}
>



  {/* GRID FOTO */}

  <div
    style={{
      display:"grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap:"20px"
    }}
  >

    {/* FOTO NOMOR CONTAINER */}

    <div>

      <button
        type="button"
        style={{
          ...button,
          background:"#0057b8"
        }}
        onClick={()=>
          document
            .getElementById(
              "photoContainer"
            )
            .click()
        }
      >
        FOTO NOMOR CONTAINER
      </button>

      <input
        id="photoContainer"
        type="file"
        accept="image/*"
        capture="environment"
        style={{
          display:"none"
        }}
        onChange={(e)=>{

          const file =
            e.target.files[0];

          if(file){
            compressImageToBase64(file, (base64) => {
              setPhoto1(base64);
            });
          }

        }}
      />

      {
        photo1 && (

          <div
            style={{
              position:"relative"
            }}
          >

            <img
              src={photo1}
              alt=""
              style={{
                width:"100%",
                height:"180px",
                objectFit:"cover",
                borderRadius:"15px",
                border:
                  "3px solid #0057b8"
              }}
            />

            <button
              onClick={()=>
                setPhoto1("")
              }
              style={{
                position:"absolute",
                top:"-10px",
                right:"-10px",
                background:"red",
                color:"#fff",
                border:"none",
                borderRadius:"50%",
                width:"35px",
                height:"35px",
                fontWeight:"bold",
                cursor:"pointer"
              }}
            >
              X
            </button>

          </div>

        )
      }

    </div>

    {/* FOTO DAMAGE */}

    <div>

      <button
        type="button"
        style={{
          ...button,
          background:"#ff9800"
        }}
        onClick={()=>
          document
            .getElementById(
              "photoDamage"
            )
            .click()
        }
      >
        FOTO DAMAGE
      </button>

      <input
        id="photoDamage"
        type="file"
        accept="image/*"
        capture="environment"
        style={{
          display:"none"
        }}
        onChange={(e)=>{

          const file =
            e.target.files[0];

          if(file){
            compressImageToBase64(file, (base64) => {
              setPhoto2(base64);
            });
          }

        }}
      />

      {
        photo2 && (

          <div
            style={{
              position:"relative"
            }}
          >

            <img
              src={photo2}
              alt=""
              style={{
                width:"100%",
                height:"180px",
                objectFit:"cover",
                borderRadius:"15px",
                border:
                  "3px solid #ff9800"
              }}
            />

            <button
              onClick={()=>
                setPhoto2("")
              }
              style={{
                position:"absolute",
                top:"-10px",
                right:"-10px",
                background:"red",
                color:"#fff",
                border:"none",
                borderRadius:"50%",
                width:"35px",
                height:"35px",
                fontWeight:"bold",
                cursor:"pointer"
              }}
            >
              X
            </button>

          </div>

        )
      }

    </div>

  </div>

</div>

    {/* BUTTON */}

    <button
      style={button}
      onClick={simpanData}
    >
      SIMPAN
    </button>

    <button
      style={logoutButton}
      onClick={()=>
        setPage("dashboard")
      }
    >
      KEMBALI
    </button>

  </div>

</div>

);

}

//====================================================
// MANAGER PAGE
// ======================================================

if(page==="manager"){

return(

<div style={managerContainer}>

<div style={sidebar}>

<img
src="/logo.png"
style={sidebarLogo}
/>

<button
style={sidebarBtn}
onClick={()=>
setPage("dashboard")
}
>
Dashboard
</button>

<button
style={sidebarBtn}
onClick={()=>
setPage("inspection")
}
>
Inspection
</button>

<button
style={sidebarBtn}
onClick={()=>
setPage("history")
}
>
Riwayat
</button>

<button
style={sidebarLogout}
onClick={()=>
setPage("login")
}
>
Logout
</button>

</div>

<div style={managerContent}>

<h1 style={managerTitle}>
MANAGER CONTROL ROOM
</h1>

<div style={cardGrid}>

<div style={{
...dashboardCard,
background:"#2F80ED"
}}>
<h2>Total Inspeksi</h2>
<h1>{history.length}</h1>
</div>

<div style={{
...dashboardCard,
background:"#F2994A"
}}>
<h2>Damage</h2>
<h1>
{
history.filter(
item=>item.condition !== "GOOD"
).length
}
</h1>
</div>

<div style={{
...dashboardCard,
background:"#27AE60"
}}>
<h2>Good</h2>
<h1>
{
history.filter(
item=>item.condition === "GOOD"
).length
}
</h1>
</div>

</div>

<div style={chartBox}>

<h2>
Inspeksi Per Hari
</h2>

<div style={{
width:"100%",
height:"300px"
}}>

<ResponsiveContainer>

<LineChart data={grafikData}>

<XAxis dataKey="tanggal" />
<YAxis />
<Tooltip />

<Line
type="monotone"
dataKey="total"
stroke="#2F80ED"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

<div style={tableBox}>

<h2>
Supervisor & Petugas
</h2>

<table style={tableStyle}>

<thead>

<tr>
<th>Nama</th>
<th>Role</th>
<th>Group</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{
users.map((user,index)=>(

<tr key={index}>

<td>{user.name}</td>
<td>{user.role === "PETUGAS" ? "PETUGAS LAPANGAN" : user.role}</td>
<td>{user.group}</td>
<td>{user.status}</td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

</div>

);

}


// ======================================================
// OFFICE DASHBOARD PAGE
// ======================================================

if(page === "office-dashboard") {

  return (

    <ErrorBoundary>
      <OfficeDashboard
        user={user}
        manifestData={manifestData}
        setManifestData={setManifestData}
        importExcel={importExcel}
        onLogout={() => setPage("login")}
        onNavigate={(p) => setPage(p)}
      />
    </ErrorBoundary>

  );

}

// ======================================================
// HISTORY PAGE
// ======================================================

if(page==="history"){

return(

<div style={bg}>

<div style={card}>

<h1 style={title}>
RIWAYAT INSPEKSI
</h1>

{
history.map((item,index)=>(

<div
key={index}
style={historyBox}
>

<h2>
{item.container}
</h2>

<p>
{item.shipName}
</p>

<p>
{item.condition}
</p>

<button
style={button}
onClick={()=>
cetakPdf(item)
}
>
CETAK PDF
</button>

</div>

))
}

<button
style={logoutButton}
onClick={()=>
setPage("dashboard")
}
>
KEMBALI
</button>

</div>

</div>

);

}

return null;

}

// ======================================================
// STYLE
// ======================================================

const bg = {

minHeight:"100vh",
background:
"linear-gradient(to bottom,#0057b8,#ff9900)",
display:"flex",
justifyContent:"center",
alignItems:"center",
padding:"20px"

};

const card = {

background:"#fff",
width:"100%",
maxWidth:"650px",
padding:"30px",
borderRadius:"30px"

};

const logo = {

width:"220px",
display:"block",
margin:"auto"

};

const title = {

  textAlign:"center",
  color:"#0B2B5C",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginBottom: "25px",
  marginTop: "15px"

};

const roleText = {

textAlign:"center"

};

const input = {

width:"100%",
padding:"18px",
marginBottom:"20px",
borderRadius:"18px",
border:"1px solid #ccc"

};

const textarea = {

width:"100%",
height:"140px",
padding:"18px",
borderRadius:"18px",
border:"1px solid #ccc",
marginBottom:"20px"

};

const button = {

width:"100%",
padding:"18px",
background:"#ff7a00",
color:"#fff",
border:"none",
borderRadius:"18px",
marginBottom:"20px"

};

const logoutButton = {

...button,
background:"red"

};

const historyBox = {

background:"#fff",
padding:"20px",
borderRadius:"20px",
marginBottom:"20px"

};

const managerContainer = {

display:"flex",
minHeight:"100vh",
background:"#f5f6fa"

};

const sidebar = {

width:"250px",
background:"#062B5B",
padding:"20px"

};

const sidebarLogo = {

width:"180px",
marginBottom:"30px"

};

const sidebarBtn = {

width:"100%",
padding:"15px",
marginBottom:"15px",
background:"#0B4DA2",
color:"white",
border:"none",
borderRadius:"12px"

};

const sidebarLogout = {

...sidebarBtn,
background:"red"

};

const managerContent = {

flex:1,
padding:"30px"

};

const managerTitle = {

fontSize:"38px",
fontWeight:"bold",
marginBottom:"30px",
color:"#004aad"

};

const cardGrid = {

display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginBottom:"30px"

};

const dashboardCard = {

padding:"25px",
borderRadius:"20px",
color:"white"

};

const chartBox = {

background:"white",
padding:"20px",
borderRadius:"20px",
marginBottom:"30px"

};

const tableBox = {

background:"white",
padding:"20px",
borderRadius:"20px"

};

const tableStyle = {

width:"100%",
borderCollapse:"collapse"

};