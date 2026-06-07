// ========================================
// FILE : src/pages/Settings.jsx
// ========================================

export default function Settings(){

return(

<div
style={{
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:
"linear-gradient(to bottom,#0057b8,#ff9900)"
}}
>

<div
style={{
background:"#fff",
padding:35,
borderRadius:35,
width:"90%",
maxWidth:500
}}
>

<h1
style={{
textAlign:"center",
color:"#004aad"
}}
>
PENGATURAN AKUN
</h1>

<input
placeholder="Ganti Password"
style={{
width:"100%",
padding:18,
marginTop:25,
borderRadius:18,
border:"1px solid #ccc",
fontSize:18
}}
/>

<button
style={{
width:"100%",
padding:18,
marginTop:25,
border:"none",
borderRadius:20,
background:"#ff7a00",
color:"#fff",
fontSize:20,
fontWeight:"bold"
}}
>
SIMPAN
</button>

</div>

</div>

)

}