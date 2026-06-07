// ======================================================
// HISTORY PAGE FINAL
// ======================================================

if(page==="history"){

const cetakPdf = ()=>{

const myWindow = window.open(
"",
"",
"width=900,height=900"
);

myWindow.document.write(`

<html>

<head>

<title>
BERITA ACARA
</title>

<style>

body{

font-family:Arial;
padding:30px;

}

h1{

text-align:center;

margin-bottom:30px;

}

table{

width:100%;
border-collapse:collapse;

margin-bottom:30px;

}

td{

border:1px solid black;
padding:12px;

font-size:16px;

}

.foto{

display:flex;
gap:20px;
margin-top:20px;

}

.foto img{

width:300px;
height:200px;
object-fit:cover;
border:1px solid black;

}

</style>

</head>

<body>

<h1>
BERITA ACARA CONTAINER INSPECTION
</h1>

<table>

<tr>
<td>Nomor Container</td>
<td>TGHU6766412</td>
</tr>

<tr>
<td>Nama Kapal</td>
<td>MERATUS</td>
</tr>

<tr>
<td>Kondisi</td>
<td>Dent/Penyok</td>
</tr>

<tr>
<td>Sisi</td>
<td>Front</td>
</tr>

<tr>
<td>Tanggal</td>
<td>
${new Date().toLocaleDateString()}
</td>
</tr>

</table>

<p>

Container telah dilakukan pemeriksaan
dan ditemukan kerusakan sesuai data
yang tercantum diatas.

</p>

<h3>
FOTO KERUSAKAN
</h3>

<div class="foto">

<img src="https://via.placeholder.com/300x200" />

<img src="https://via.placeholder.com/300x200" />

</div>

</body>

</html>

`);

myWindow.document.close();

myWindow.focus();

setTimeout(()=>{

myWindow.print();

},500);

};

return(

<div style={bg}>

<div style={card}>

<h1 style={title}>
RIWAYAT INSPEKSI
</h1>

<div style={historyBox}>

<h2>
TGHU6766412
</h2>

<p>
MV MERATUS
</p>

<p>
Dent/Penyok
</p>

<p>
Front
</p>

<p>
16/05/2026
</p>

<button
style={button}
onClick={cetakPdf}
>
CETAK PDF
</button>

</div>

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