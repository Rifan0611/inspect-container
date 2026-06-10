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

<svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 24px auto", display: "block" }}>
  <path d="M32 6 L54 17 L32 28 L10 17 Z" fill="url(#topGradRep)" stroke="#004aad" strokeWidth="1" />
  <path d="M10 17 L32 28 L32 54 L10 43 Z" fill="url(#leftGradRep)" />
  <path d="M32 28 L54 17 L54 43 L32 54 Z" fill="url(#rightGradRep)" />
  <path d="M15 20.5 L15 45.5 M20 23 L20 48 M25 25.5 L25 50.5 M30 28 L30 53" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
  <path d="M37 52.5 L37 27.5 M42 50 L42 25 M47 47.5 L47 22.5 M52 45 L52 20" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
  <path d="M10 17 L32 28 L54 17 M32 28 L32 54" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  <path d="M10 17 L10 43 L32 54 L54 43 L54 17 M32 6 L54 17 L32 28 L10 17 Z" stroke="#00357a" strokeWidth="1.5" strokeLinejoin="round" />
  <defs>
    <linearGradient id="topGradRep" x1="10" y1="17" x2="54" y2="17" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#2563eb" />
      <stop offset="100%" stopColor="#004aad" />
    </linearGradient>
    <linearGradient id="leftGradRep" x1="10" y1="17" x2="32" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#0b2c63" />
      <stop offset="100%" stopColor="#00183b" />
    </linearGradient>
    <linearGradient id="rightGradRep" x1="32" y1="28" x2="54" y2="43" gradientUnits="userSpaceOnUse">
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