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

<img
src="/logo.png"
alt=""
style={{
width:240,
display:"block",
margin:"auto"
}}
/>

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

role==="SUPERVISOR")

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