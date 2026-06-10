import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Camera, ArrowLeft, Loader2 } from "lucide-react";
import API_URL from "../config/api";
import "./Inspection.css";
import SearchSelect, { ISO_CODES, CATEGORIES } from "../components/SearchSelect";

const compressImage = (file) => {
  return new Promise((resolve) => {
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
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, "image/jpeg", 0.7);
      };
      img.onerror = () => {
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
};

export default function Inspection() {
  const navigate = useNavigate();

  const [containerNumber, setContainerNumber] = useState("");
  const [shipName, setShipName] = useState("");
  const [status, setStatus] = useState("");
  const [iso, setIso] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  
  const [photos, setPhotos] = useState([]);
  const [manifestList, setManifestList] = useState([]);
  const [inspectedContainers, setInspectedContainers] = useState([]);
  const [selectedSides, setSelectedSides] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState(["GOOD"]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadManifestAndInspections();
  }, []);

  const loadManifestAndInspections = async () => {
    try {
      // Load Manifest
      const manifestRes = await fetch(`${API_URL}/api/manifest`);
      const manifestData = await manifestRes.json();
      if (Array.isArray(manifestData)) {
        setManifestList(manifestData);
      }

      // Load Inspected Containers to filter them out
      const inspectionRes = await fetch(`${API_URL}/api/inspection`);
      const inspectionData = await inspectionRes.json();
      if (Array.isArray(inspectionData)) {
        setInspectedContainers(inspectionData.map(item => item.container?.toString().toUpperCase().trim()));
      }
    } catch (err) {
      console.error("Error loading manifest / inspections data:", err);
    }
  };

  // Filter manifest to get only uninspected and not loaded containers
  const availableContainers = manifestList.filter(item => {
    const containerNum = item.container?.toString().toUpperCase().trim();
    if (!containerNum) return false;

    // 1. Filter out if already inspected
    const isAlreadyInspected = inspectedContainers.includes(containerNum);

    // 2. Filter out if status is already loaded or exited
    const statusStr = (item.status || "").toString().toUpperCase().trim();
    const isLoadedOrOut = statusStr === "MUAT" || statusStr === "GATE OUT" || statusStr === "KELUAR" || statusStr === "LOAD";

    return !isAlreadyInspected && !isLoadedOrOut;
  });

  const handleContainerChange = (e) => {
    const value = e.target.value.toUpperCase().trim();
    setContainerNumber(value);

    const found = manifestList.find(
      item => item.container?.toString().toUpperCase().trim() === value
    );

    if (found) {
      setShipName(found.shipName || "");
      setStatus(found.status || "");
      setIso(found.iso || "");
      setCategory(found.category || "");
    } else {
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
    }
  };

  const handleSearchContainer = () => {
    if (!containerNumber.trim()) {
      alert("Harap masukkan nomor container terlebih dahulu!");
      return;
    }
    const found = availableContainers.find(
      item => item.container?.toString().toUpperCase().trim() === containerNumber
    );

    if (found) {
      alert("Data container ditemukan!");
    } else {
      // Check if it's already inspected or loaded to show friendly alert
      const inManifest = manifestList.find(
        item => item.container?.toString().toUpperCase().trim() === containerNumber
      );
      if (inManifest) {
        const statusStr = (inManifest.status || "").toString().toUpperCase().trim();
        const isLoadedOrOut = statusStr === "MUAT" || statusStr === "GATE OUT" || statusStr === "KELUAR" || statusStr === "LOAD";
        if (isLoadedOrOut) {
          alert(`Container ${containerNumber} tidak dapat diinspeksi karena statusnya sudah "${inManifest.status}" (Muat/Keluar).`);
        } else {
          alert(`Container ${containerNumber} sudah pernah diinspeksi sebelumnya.`);
        }
      } else {
        alert("Nomor container tidak ditemukan di manifest.");
      }
    }
  };

  const handleSideToggle = (val) => {
    if (selectedConditions.includes("Good") || selectedConditions.includes("GOOD")) return;
    setSelectedSides(prev =>
      prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
    );
  };

  const handleConditionToggle = (val) => {
    if (val === "Good" || val === "GOOD") {
      setSelectedConditions(["GOOD"]);
      setSelectedSides([]);
    } else {
      setSelectedConditions(prev => {
        const next = prev.filter(item => item !== "Good" && item !== "GOOD");
        return next.includes(val) ? next.filter(item => item !== val) : [...next, val];
      });
    }
  };

  const saveInspection = async () => {
    if (!containerNumber.trim()) {
      alert("Harap masukkan nomor container!");
      return;
    }
    if (!shipName.trim()) {
      alert("Harap masukkan nama kapal!");
      return;
    }
    if (photos.length === 0) {
      alert("Harap ambil atau unggah foto formulir CDR!");
      return;
    }

    setIsUploading(true);

    try {
      // Upload all photos in the list
      const uploadedUrls = [];
      for (const photoObj of photos) {
        if (photoObj.file) {
          const compressedBlob = await compressImage(photoObj.file);
          const formData = new FormData();
          formData.append("photo", compressedBlob, photoObj.file.name);

          const uploadRes = await fetch(`${API_URL}/api/upload/image`, {
            method: "POST",
            body: formData
          });

          let uploadData;
          const uploadContentType = uploadRes.headers.get("content-type");
          if (uploadContentType && uploadContentType.includes("application/json")) {
            uploadData = await uploadRes.json();
          } else {
            const errorText = await uploadRes.text();
            throw new Error(`Upload fail (${uploadRes.status}): ${errorText.substring(0, 100)}`);
          }

          if (!uploadRes.ok) {
            throw new Error(uploadData.message || "Gagal mengunggah foto");
          }
          uploadedUrls.push(`${API_URL}/uploads/${uploadData.filename || uploadData.file}`);
        } else {
          uploadedUrls.push(photoObj.url);
        }
      }
      const uploadedPhotoUrl = uploadedUrls.join(",");

      const activeUser = JSON.parse(localStorage.getItem("user"));

      const data = {
        container: containerNumber,
        shipName: shipName || "-",
        status: status || "-",
        iso: iso || "-",
        category: category || "-",
        condition: selectedConditions.length > 0 ? selectedConditions.join(", ") : "Good",
        side: selectedSides.length > 0 ? selectedSides.join(", ") : "General",
        note: note,
        photo1: uploadedPhotoUrl,
        photo2: "",
        petugas: activeUser?.nama || "Petugas Lapangan",
        date: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      let resData;
      const resContentType = response.headers.get("content-type");
      if (resContentType && resContentType.includes("application/json")) {
        resData = await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(`Simpan fail (${response.status}): ${errorText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(resData?.error || "Gagal menyimpan inspeksi ke server");
      }

      // Save to local history for sync
      const newHistory = [
        data,
        ...(JSON.parse(localStorage.getItem("history")) || [])
      ];
      localStorage.setItem("history", JSON.stringify(newHistory));

      // Trigger event for dashboard refresh
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("focus"));

      alert("INSPEKSI BERHASIL TERSIMPAN");
      setPhotos([]);
      navigate("/history");
    } catch (err) {
      console.error("Error saving inspection:", err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="inspection-container-page">
      <div className="inspection-wrapper">
        
        {/* BANNER KUNING */}
        <div className="form-header-banner">
          FORM PETUGAS (INSPEKSI CDR)
        </div>

        {/* CARD UTAMA */}
        <div className="inspection-card">
          
          {/* NOMOR CONTAINER */}
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>
              Nomor Container
              <span className="required-star">*</span>
            </label>
            <input
              type="text"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
              placeholder="Masukkan nomor container..."
              className="form-input"
              disabled={isUploading}
            />
          </div>

          {/* METADATA INPUTS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="form-group">
              <label>Nama Kapal <span className="required-star">*</span></label>
              <input
                type="text"
                value={shipName}
                onChange={(e) => setShipName(e.target.value)}
                placeholder="Masukkan nama kapal..."
                className="form-input"
                disabled={isUploading}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <SearchSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={CATEGORIES}
                placeholder="DRY"
                disabled={isUploading}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="form-group">
              <label>Status (Full/Empty)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
                disabled={isUploading}
                style={{ backgroundImage: "none", paddingRight: "18px" }}
              >
                <option value="">- Pilih Status -</option>
                <option value="FULL">FULL</option>
                <option value="EMPTY">EMPTY</option>
              </select>
            </div>
            <div className="form-group">
              <label>ISO Code</label>
              <SearchSelect
                value={iso}
                onChange={(val) => setIso(val)}
                options={ISO_CODES}
                placeholder="-ISO Code-"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* FOTO DOKUMENTASI CDR (BISA LEBIH DARI SATU) */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Foto Dokumentasi / Formulir CDR <span className="required-star">*</span> (Bisa lebih dari satu)</label>
            <div className="photos-preview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginTop: "8px" }}>
              
              {photos.map((photo, idx) => (
                <div key={idx} className="photo-preview-item" style={{ position: "relative", height: "140px", borderRadius: "12px", overflow: "hidden", border: "2px solid #cbd5e1" }}>
                  <img src={photo.url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    className="btn-delete-photo"
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10
                    }}
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* ADD PHOTO CARD */}
              <div 
                className="cdr-dropzone" 
                style={{ 
                  height: "140px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "10px", 
                  margin: 0,
                  boxSizing: "border-box" 
                }}
                onClick={() => !isUploading && document.getElementById("cdrPhotoInput").click()}
              >
                <Camera size={24} className="placeholder-icon" />
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", fontWeight: "700" }}>Tambah Foto</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#64748b" }}>Kamera / Galeri</p>
              </div>

            </div>

            <input
              id="cdrPhotoInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPhotos(prev => [...prev, {
                    file,
                    url: URL.createObjectURL(file)
                  }]);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* DIAGRAM INTERAKTIF KONTENER */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Visual Sisi Kerusakan (Klik area pada diagram untuk memilih)</label>
            <div className="interactive-diagram-container">
              <img 
                src="/container-diagram.png" 
                alt="Container Damage Diagram" 
                className="interactive-diagram-image"
              />
              {[
                { val: "Front/Depan", label: "Front (Depan)", x: 12, y: 30 },
                { val: "Left Side/Sisi Kiri", label: "Left Side (Kiri)", x: 28, y: 45 },
                { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 18, y: 75 },
                { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 58 },
                { val: "Roof/Atas", label: "Roof (Atas)", x: 80, y: 26 },
                { val: "Right Side/Sisi Kanan", label: "Right Side (Kanan)", x: 88, y: 48 },
                { val: "Rear/Belakang", label: "Rear/Doors (Belakang)", x: 71, y: 60 }
              ].map((hotspot) => {
                const isChecked = selectedSides.includes(hotspot.val);
                const isDisabled = selectedConditions.includes("Good") || selectedConditions.includes("GOOD");
                return (
                  <div
                    key={hotspot.val}
                    className="diagram-hotspot"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    onClick={() => !isDisabled && !isUploading && handleSideToggle(hotspot.val)}
                  >
                    <div className={`hotspot-badge ${isChecked ? "checked" : ""}`}>
                      {isChecked ? "✓" : "!"}
                    </div>
                    <span className="hotspot-label">{hotspot.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHECKLIST SISI & KONDISI */}
          <div className="checklist-container-grid">
            {/* SISI */}
            <div className="checklist-card">
              <h4 className="checklist-title">Ceklis Sisi Kerusakan</h4>
              <div className="checkbox-list">
                {["Front/Depan", "Rear/Belakang", "Left Side/Sisi Kiri", "Right Side/Sisi Kanan", "Roof/Atas", "Bottom/Bawah", "Inside/Dalam"].map(s => {
                  const isChecked = selectedSides.includes(s);
                  const isDisabled = selectedConditions.includes("Good") || selectedConditions.includes("GOOD");
                  return (
                    <label key={s} className={`checkbox-label ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleSideToggle(s)}
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* KONDISI */}
            <div className="checklist-card">
              <h4 className="checklist-title">Ceklis Kondisi Kontainer</h4>
              <div className="checkbox-list">
                {[
                  { val: "GOOD", label: "GOOD" },
                  { val: "Bent/Bengkok", label: "Bent/Bengkok" },
                  { val: "Broken/Pecah", label: "Broken/Pecah" },
                  { val: "Hole/Berlubang", label: "Hole/Berlubang" },
                  { val: "Cut/Terpotong", label: "Cut/Terpotong" },
                  { val: "Dented/Penyok", label: "Dented/Penyok" },
                  { val: "Missing/Hilang", label: "Missing/Hilang" },
                  { val: "Scraped/Tergores", label: "Scraped/Tergores" },
                  { val: "Torn/Robek", label: "Torn/Robek" },
                  { val: "Leaking/Bocor", label: "Leaking/Bocor" }
                ].map(c => {
                  const isChecked = selectedConditions.includes(c.val);
                  return (
                    <label key={c.val} className={`checkbox-label ${isChecked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleConditionToggle(c.val)}
                      />
                      <span>{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CATATAN */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Catatan Kronologi</label>
            <textarea
              placeholder="Tambahkan catatan kronologi jika diperlukan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-textarea"
              disabled={isUploading}
            />
          </div>

          {/* BUTTON ACTIONS */}
          <div className="form-footer-buttons">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate(-1)}
              disabled={isUploading}
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
            
            <button
              type="button"
              className="btn-save-inspection"
              onClick={saveInspection}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Simpan Inspeksi CDR</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}