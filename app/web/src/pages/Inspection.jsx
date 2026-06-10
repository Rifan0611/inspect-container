import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Camera, ArrowLeft, Loader2 } from "lucide-react";
import API_URL from "../config/api";
import "./Inspection.css";

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
  const [selectedConditions, setSelectedConditions] = useState(["Good"]);
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
    if (selectedConditions.includes("Good")) return;
    setSelectedSides(prev =>
      prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
    );
  };

  const handleConditionToggle = (val) => {
    if (val === "Good") {
      setSelectedConditions(["Good"]);
      setSelectedSides([]);
    } else {
      setSelectedConditions(prev => {
        const next = prev.filter(item => item !== "Good");
        return next.includes(val) ? next.filter(item => item !== val) : [...next, val];
      });
    }
  };

  const saveInspection = async () => {
    if (!containerNumber) {
      alert("Harap pilih nomor container!");
      return;
    }
    if (photos.length === 0) {
      alert("Harap ambil atau unggah foto formulir CDR!");
      return;
    }

    setIsUploading(true);

    try {
      // Upload the photo
      let uploadedPhotoUrl = "";
      const photoObj = photos[0];
      if (photoObj.file) {
        const formData = new FormData();
        formData.append("photo", photoObj.file);

        const uploadRes = await fetch(`${API_URL}/api/upload/image`, {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Gagal mengunggah foto");
        }
        uploadedPhotoUrl = `${API_URL}/uploads/${uploadData.filename}`;
      } else {
        uploadedPhotoUrl = photoObj.url;
      }

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

      if (!response.ok) {
        const resData = await response.json();
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
            <div className="container-search-wrapper">
              <input
                type="text"
                list="containerList"
                value={containerNumber}
                onInput={handleContainerChange}
                onChange={handleContainerChange}
                placeholder="Masukkan atau pilih nomor container..."
                className="form-input"
                disabled={isUploading}
              />
              <button
                type="button"
                className="btn-search-container"
                onClick={handleSearchContainer}
                disabled={isUploading}
              >
                Cari
              </button>
            </div>
            <datalist id="containerList">
              {availableContainers.map((item, index) => (
                <option key={index} value={item.container} />
              ))}
            </datalist>

            {/* AUTOFILL METADATA BADGES */}
            {shipName && (
              <div className="autofill-metadata-container">
                <div className="meta-badge"><strong>Kapal:</strong> {shipName}</div>
                <div className="meta-badge"><strong>Status:</strong> {status}</div>
                <div className="meta-badge"><strong>ISO:</strong> {iso}</div>
                <div className="meta-badge"><strong>Kategori:</strong> {category}</div>
              </div>
            )}
          </div>

          {/* FOTO FORMULIR CDR */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Foto Formulir CDR <span className="required-star">*</span></label>
            <div 
              className="cdr-dropzone"
              onClick={() => !isUploading && document.getElementById("cdrPhotoInput").click()}
            >
              {photos.length === 0 ? (
                <div className="dropzone-placeholder">
                  <Camera size={36} className="placeholder-icon" />
                  <p className="placeholder-main">Ambil Foto / Unggah Formulir CDR</p>
                  <p className="placeholder-sub">Klik untuk membuka kamera atau galeri</p>
                </div>
              ) : (
                <div className="dropzone-preview">
                  <img src={photos[0].url} alt="CDR Form Preview" />
                  <div className="preview-overlay">
                    <span>Ganti Foto</span>
                  </div>
                </div>
              )}
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
                  setPhotos([{
                    file,
                    url: URL.createObjectURL(file)
                  }]);
                }
              }}
            />
          </div>

          {/* CHECKLIST SISI & KONDISI */}
          <div className="checklist-container-grid">
            {/* SISI */}
            <div className="checklist-card">
              <h4 className="checklist-title">Ceklis Sisi Kerusakan</h4>
              <div className="checkbox-list">
                {["Front", "Rear", "Left Side", "Right Side", "Top Side", "Bottom Side"].map(s => {
                  const isChecked = selectedSides.includes(s);
                  const isDisabled = selectedConditions.includes("Good");
                  return (
                    <label key={s} className={`checkbox-label ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleSideToggle(s)}
                      />
                      <span>{s === "Front" ? "Depan (Front)" :
                             s === "Rear" ? "Belakang (Rear)" :
                             s === "Left Side" ? "Kiri (Left Side)" :
                             s === "Right Side" ? "Kanan (Right Side)" :
                             s === "Top Side" ? "Atas (Top Side)" :
                             "Bawah (Bottom Side)"}</span>
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
                  { val: "Good", label: "Kondisi Baik (Good)" },
                  { val: "Dent/Penyok", label: "Penyok (Dent)" },
                  { val: "Hole/Lubang", label: "Lubang (Hole)" },
                  { val: "Rust/Karat", label: "Karat (Rust)" },
                  { val: "Broken/Pecah", label: "Pecah (Broken)" },
                  { val: "Other/Lainnya", label: "Lainnya (Other)" }
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