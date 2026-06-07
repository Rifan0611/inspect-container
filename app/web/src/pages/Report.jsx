// ========================================
// FILE : src/pages/Report.jsx
// ========================================

export default function Report(){

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
padding:40,
borderRadius:35,
width:"90%",
maxWidth:600
}}
>

<img
src="/logo.png"
alt=""
style={{
width:220,
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
EXPORT PDF
</h1>

<button
style={{
width:"100%",
padding:20,
marginTop:30,
border:"none",
borderRadius:20,
background:"#ff7a00",
color:"#fff",
fontSize:22,
fontWeight:"bold"
}}
>
DOWNLOAD PDF
</button>

</div>

</div>

)

}