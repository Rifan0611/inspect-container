// src/pages/ManifestUpload.jsx

import * as XLSX from "xlsx";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function ManifestUpload() {

  const [fileName, setFileName] = useState("");
  const [shipName, setShipName] = useState("");
  const [manifestData, setManifestData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const importExcel = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (!shipName.trim()) {
      alert("ISI NAMA KAPAL TERLEBIH DAHULU");
      return;
    }

    setSaved(false);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {

      try {

        const binary = evt.target.result;

        const workbook = XLSX.read(binary, {
          type: "binary"
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const finalData = data.map(item => ({
          container: item.container || "",
          shipName: shipName,
          status: item.status || "",
          iso: item.iso || "",
          category: item.category || ""
        }));

        setManifestData(finalData);

        localStorage.setItem(
          "manifestData",
          JSON.stringify(finalData)
        );

        alert("MANIFEST BERHASIL DIUPLOAD — Tekan \"Simpan ke Database\" untuk menyimpan.");

      } catch (err) {

        console.error(err);
        alert("GAGAL MEMBACA FILE EXCEL");

      }

    };

    reader.readAsBinaryString(file);

  };

  const saveToBackend = async () => {

    if (!manifestData.length) {
      alert("BELUM ADA DATA MANIFEST");
      return;
    }

    setSaving(true);

    try {

      const res = await fetch(`${API_URL}/manifest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manifestData)
      });

      const result = await res.json();

      if (result.success) {
        setSaved(true);
        alert("DATA BERHASIL DISIMPAN KE DATABASE");
      } else {
        alert("GAGAL MENYIMPAN: " + (result.error || "Unknown error"));
      }

    } catch (err) {

      console.error(err);
      alert("GAGAL TERHUBUNG KE SERVER");

    } finally {

      setSaving(false);

    }

  };

  return (

    <div style={bg}>

      <div style={card}>

        <h1 style={title}>
          IMPORT MANIFEST
        </h1>

        <input
          type="text"
          placeholder="Nama Kapal"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
          style={input}
        />

        <br />
        <br />

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={importExcel}
          style={input}
        />

        <p style={fileText}>{fileName}</p>

        {manifestData.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={saveToBackend}
              disabled={saving || saved}
              style={{
                ...btnStyle,
                background: saved ? "#27ae60" : "#0047b3",
                cursor: saving || saved ? "not-allowed" : "pointer"
              }}
            >
              {saving ? "MENYIMPAN..." : saved ? "✓ TERSIMPAN" : "SIMPAN KE DATABASE"}
            </button>
          </div>
        )}

        <div style={tableBox}>

          <h3>DATA MANIFEST ({manifestData.length} baris)</h3>

          <table style={table}>

            <thead>
              <tr>
                <th style={th}>CONTAINER</th>
                <th style={th}>NAMA KAPAL</th>
                <th style={th}>STATUS</th>
                <th style={th}>ISO</th>
                <th style={th}>CATEGORY</th>
              </tr>
            </thead>

            <tbody>
              {manifestData.map((item, index) => (
                <tr key={index}>
                  <td style={td}>{item.container}</td>
                  <td style={td}>{item.shipName}</td>
                  <td style={td}>{item.status}</td>
                  <td style={td}>{item.iso}</td>
                  <td style={td}>{item.category}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        <div style={infoBox}>

          <h3>FORMAT EXCEL</h3>

          <p>container</p>
          <p>status</p>
          <p>iso</p>
          <p>category</p>

          <br />

          <p>SPNU2110990</p>
          <p>EMPTY</p>
          <p>22G1</p>
          <p>GP</p>

        </div>

      </div>

    </div>

  );

}

// STYLE

const bg = {

  minHeight: "100vh",

  background:
    "linear-gradient(to bottom,#005bbb,#f39c12)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: 20

};

const card = {

  width: "100%",

  maxWidth: 900,

  background: "#f4f4f4",

  borderRadius: 30,

  padding: 30,

  boxSizing: "border-box"

};

const title = {

  textAlign: "center",

  color: "#0047b3",

  fontSize: 40,

  fontFamily: "serif",

  marginBottom: 30

};

const input = {

  width: "100%",

  padding: 15,

  borderRadius: 15,

  border: "1px solid #ccc",

  background: "white",

  boxSizing: "border-box"

};

const fileText = {

  marginTop: 20,

  fontWeight: "bold",

  textAlign: "center"

};

const tableBox = {

  marginTop: 30,

  overflowX: "auto"

};

const table = {

  width: "100%",

  borderCollapse: "collapse"

};

const th = {

  background: "#0047b3",

  color: "white",

  padding: 12,

  border: "1px solid #ccc"

};

const td = {

  padding: 12,

  border: "1px solid #ccc",

  background: "white"

};

const infoBox = {

  marginTop: 30,

  background: "white",

  padding: 20,

  borderRadius: 20

};

const btnStyle = {

  padding: "14px 36px",

  borderRadius: 12,

  border: "none",

  color: "white",

  fontSize: 16,

  fontWeight: "bold",

  letterSpacing: 1

};