import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Camera, ArrowLeft, Loader2 } from "lucide-react";
import API_URL from "../config/api";
import Tesseract from "tesseract.js";
import "./Inspection.css";
import SearchSelect, {
  ISO_CODES,
  CATEGORIES,
} from "../components/SearchSelect";

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
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/jpeg",
          0.7,
        );
      };
      img.onerror = () => {
        resolve(file);
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
};

const preprocessImageForOCR = (file) => {
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
        const maxDim = 1200;
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
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const contrast = 1.5; 
          let color = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
          color = Math.min(255, Math.max(0, color));
          
          data[i] = color;
          data[i + 1] = color;
          data[i + 2] = color;
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
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
  const [containerNoPhoto, setContainerNoPhoto] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manifestList, setManifestList] = useState([]);
  const [inspectedContainers, setInspectedContainers] = useState([]);
  const [selectedSides, setSelectedSides] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [locationGPS, setLocationGPS] = useState(null);

  useEffect(() => {
    loadManifestAndInspections();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocationGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geo error:", err),
        { enableHighAccuracy: true }
      );
    }
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
        setInspectedContainers(
          inspectionData.map((item) =>
            item.container?.toString().toUpperCase().trim(),
          ),
        );
      }
    } catch (err) {
      console.error("Error loading manifest / inspections data:", err);
    }
  };

  // Filter manifest to get only uninspected and not loaded containers
  const availableContainers = manifestList.filter((item) => {
    const containerNum = item.container?.toString().toUpperCase().trim();
    if (!containerNum) return false;

    // 1. Filter out if already inspected
    const isAlreadyInspected = inspectedContainers.includes(containerNum);

    // 2. Filter out if status is already loaded or exited
    const statusStr = (item.status || "").toString().toUpperCase().trim();
    const isLoadedOrOut =
      statusStr === "MUAT" ||
      statusStr === "GATE OUT" ||
      statusStr === "KELUAR" ||
      statusStr === "LOAD";

    return !isAlreadyInspected && !isLoadedOrOut;
  });

  const handleContainerChange = (e) => {
    const value = e.target.value.toUpperCase().trim();
    setContainerNumber(value);

    const found = manifestList.find(
      (item) => item.container?.toString().toUpperCase().trim() === value,
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

  const handleContainerNoPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setContainerNoPhoto({
      file,
      url: URL.createObjectURL(file),
    });

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      const extractContainerNumber = (rawText) => {
        const clean = rawText.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let bestMatch = null;
        let bestScore = -1;

        for (let i = 0; i <= clean.length - 11; i++) {
          const candidate = clean.substring(i, i + 11);
          const prefix = candidate.substring(0, 4);
          const suffix = candidate.substring(4, 11);
          
          const prefixLetters = (prefix.match(/[A-Z]/g) || []).length;
          const suffixNumbers = (suffix.match(/[0-9]/g) || []).length;
          
          if (prefixLetters >= 3 && suffixNumbers >= 5) {
            let score = prefixLetters + suffixNumbers;
            if (['U', 'J', 'Z'].includes(prefix[3])) {
              score += 2;
            }
            if (score > bestScore) {
              bestScore = score;
              bestMatch = candidate;
            }
          }
        }
        return bestMatch;
      };

      const scannedNum = extractContainerNumber(text);
      if (scannedNum) {
        setContainerNumber(scannedNum);
        
        // Auto-fill from manifest
        const found = manifestList.find(
          (item) => item.container?.toString().toUpperCase().trim() === scannedNum
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
        alert(`Pindai berhasil! Container terdeteksi: ${scannedNum}\n\n(Mohon periksa kembali jika ada huruf/angka yang kurang tepat)`);
      } else {
        const snippet = text.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        alert(`Nomor kontainer tidak ditemukan pada foto. Silakan foto ulang.\n(Teks terbaca: ${snippet}...)`);
      }
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Terjadi kesalahan saat membaca foto.");
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  const handleSearchContainer = () => {
    if (!containerNumber.trim()) {
      alert("Harap masukkan nomor container terlebih dahulu!");
      return;
    }
    const found = availableContainers.find(
      (item) =>
        item.container?.toString().toUpperCase().trim() === containerNumber,
    );

    if (found) {
      alert("Data container ditemukan!");
    } else {
      // Check if it's already inspected or loaded to show friendly alert
      const inManifest = manifestList.find(
        (item) =>
          item.container?.toString().toUpperCase().trim() === containerNumber,
      );
      if (inManifest) {
        const statusStr = (inManifest.status || "")
          .toString()
          .toUpperCase()
          .trim();
        const isLoadedOrOut =
          statusStr === "MUAT" ||
          statusStr === "GATE OUT" ||
          statusStr === "KELUAR" ||
          statusStr === "LOAD";
        if (isLoadedOrOut) {
          alert(
            `Container ${containerNumber} tidak dapat diinspeksi karena statusnya sudah "${inManifest.status}" (Muat/Keluar).`,
          );
        } else {
          alert(
            `Container ${containerNumber} sudah pernah diinspeksi sebelumnya.`,
          );
        }
      } else {
        alert("Nomor container tidak ditemukan di manifest.");
      }
    }
  };

  const handleSideToggle = (val) => {
    if (
      selectedConditions.includes("Good") ||
      selectedConditions.includes("GOOD")
    )
      return;
    setSelectedSides((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val],
    );
  };

  const handleConditionToggle = (val) => {
    if (val === "Good" || val === "GOOD") {
      setSelectedConditions(["GOOD"]);
      setSelectedSides([]);
    } else {
      setSelectedConditions((prev) => {
        const next = prev.filter((item) => item !== "Good" && item !== "GOOD");
        return next.includes(val)
          ? next.filter((item) => item !== val)
          : [...next, val];
      });
    }
  };

  const saveInspection = async () => {
    if (!containerNumber.trim()) {
      alert("Harap masukkan nomor container!");
      return;
    }
    if (!containerNoPhoto) {
      alert("Harap ambil atau unggah foto nomor container!");
      return;
    }
    if (photos.length === 0) {
      alert("Harap ambil atau unggah foto formulir CDR!");
      return;
    }

    setIsUploading(true);

    try {
      // Upload container number photo
      let uploadedContainerNoUrl = "";
      if (containerNoPhoto) {
        if (containerNoPhoto.file) {
          const compressedBlob = await compressImage(containerNoPhoto.file);
          const formData = new FormData();
          formData.append("photo", compressedBlob, containerNoPhoto.file.name);

          const uploadRes = await fetch(`${API_URL}/api/upload/image`, {
            method: "POST",
            body: formData,
          });

          let uploadData;
          const uploadContentType = uploadRes.headers.get("content-type");
          if (
            uploadContentType &&
            uploadContentType.includes("application/json")
          ) {
            uploadData = await uploadRes.json();
          } else {
            const errorText = await uploadRes.text();
            throw new Error(
              `Upload fail (${uploadRes.status}): ${errorText.substring(0, 100)}`,
            );
          }

          if (!uploadRes.ok) {
            throw new Error(
              uploadData.message || "Gagal mengunggah foto nomor container",
            );
          }
          uploadedContainerNoUrl = `${API_URL}/uploads/${uploadData.filename || uploadData.file}`;
        } else {
          uploadedContainerNoUrl = containerNoPhoto.url;
        }
      }

      // Upload all photos in the list
      const uploadedUrls = [];
      for (const photoObj of photos) {
        if (photoObj.file) {
          const compressedBlob = await compressImage(photoObj.file);
          const formData = new FormData();
          formData.append("photo", compressedBlob, photoObj.file.name);

          const uploadRes = await fetch(`${API_URL}/api/upload/image`, {
            method: "POST",
            body: formData,
          });

          let uploadData;
          const uploadContentType = uploadRes.headers.get("content-type");
          if (
            uploadContentType &&
            uploadContentType.includes("application/json")
          ) {
            uploadData = await uploadRes.json();
          } else {
            const errorText = await uploadRes.text();
            throw new Error(
              `Upload fail (${uploadRes.status}): ${errorText.substring(0, 100)}`,
            );
          }

          if (!uploadRes.ok) {
            throw new Error(uploadData.message || "Gagal mengunggah foto");
          }
          uploadedUrls.push(
            `${API_URL}/uploads/${uploadData.filename || uploadData.file}`,
          );
        } else {
          uploadedUrls.push(photoObj.url);
        }
      }
      const uploadedPhotoUrl = uploadedUrls.join(",");

      const activeUser = JSON.parse(localStorage.getItem("user"));

      let finalNote = note;
      if (locationGPS) {
        const mapsLink = `https://maps.google.com/?q=${locationGPS.lat},${locationGPS.lng}`;
        finalNote = note ? `${note}\n\nLokasi GPS: ${mapsLink}` : `Lokasi GPS: ${mapsLink}`;
      }

      const data = {
        container: containerNumber,
        shipName: shipName || "-",
        status: status || "-",
        iso: iso || "-",
        category: category || "-",
        condition:
          selectedConditions.length > 0 ? selectedConditions.join(", ") : "-",
        side: selectedSides.length > 0 ? selectedSides.join(", ") : "-",
        note: finalNote,
        photo1: uploadedPhotoUrl,
        photo2: uploadedContainerNoUrl,
        petugas: activeUser?.nama || "Petugas Lapangan",
        date: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/api/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let resData;
      const resContentType = response.headers.get("content-type");
      if (resContentType && resContentType.includes("application/json")) {
        resData = await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(
          `Simpan fail (${response.status}): ${errorText.substring(0, 100)}`,
        );
      }

      if (!response.ok) {
        throw new Error(resData?.error || "Gagal menyimpan inspeksi ke server");
      }

      // Save to local history for sync
      const newHistory = [
        data,
        ...(JSON.parse(localStorage.getItem("history")) || []),
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
        <div className="form-header-banner">FORM PETUGAS (INSPEKSI CDR)</div>

        {/* CARD UTAMA */}
        <div className="inspection-card">
          {/* NOMOR CONTAINER & FOTO NOMOR CONTAINER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="form-group">
              <label>
                Nomor Container
                <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={containerNumber}
                onChange={handleContainerChange}
                placeholder="Masukkan nomor container..."
                className="form-input"
                disabled={isUploading}
              />
            </div>
            <div className="form-group">
              <label>
                Foto Nomor Container <span className="required-star">*</span>
              </label>
              {containerNoPhoto ? (
                <div
                  style={{
                    position: "relative",
                    height: "46px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <img
                    src={containerNoPhoto.url}
                    alt="Foto Nomor Container"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      fontSize: "10px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                    onClick={() => {
                      setContainerNoPhoto(null);
                      setContainerNumber("");
                      setShipName("");
                      setStatus("");
                      setIso("");
                      setCategory("");
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="cdr-dropzone"
                  style={{
                    height: "46px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "0 10px",
                    cursor: "pointer",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                  }}
                  onClick={() =>
                    !isScanning &&
                    document.getElementById("containerNoPhotoInput").click()
                  }
                >
                  {isScanning ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Loader2
                        className="animate-spin"
                        size={16}
                        style={{ color: "#3b82f6" }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#3b82f6",
                        }}
                      >
                        Pindai...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera
                        size={18}
                        className="placeholder-icon"
                        style={{ color: "#64748b" }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#475569",
                        }}
                      >
                        Ambil Foto Nomor
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                id="containerNoPhotoInput"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                disabled={isScanning}
                onChange={handleContainerNoPhotoChange}
              />
            </div>
          </div>

          {/* METADATA INPUTS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="form-group" style={{ gridColumn: "span 2" }}>
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

          {/* FOTO DOKUMENTASI CDR (HORIZONTAL SCROLLING - LEBIH MODERN & KOMPAK) */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>
              Foto Dokumentasi / Detail Kerusakan{" "}
              <span className="required-star">*</span> (Bisa lebih dari satu)
            </label>
            <div
              className="photos-preview-scroll"
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "12px",
                marginTop: "8px",
                overflowX: "auto",
                paddingBottom: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="photo-preview-item"
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid #cbd5e1",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Preview ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    className="btn-delete-photo"
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                    onClick={() =>
                      setPhotos((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* ADD PHOTO CARD */}
              <div
                className="cdr-dropzone"
                style={{
                  width: "100px",
                  height: "100px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  margin: 0,
                  boxSizing: "border-box",
                  flexShrink: 0,
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  !isUploading &&
                  document.getElementById("cdrPhotoInput").click()
                }
              >
                <Camera size={20} className="placeholder-icon" />
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  Tambah
                </p>
                <p style={{ margin: "0", fontSize: "9px", color: "#64748b" }}>
                  Foto
                </p>
              </div>
            </div>

            <input
              id="cdrPhotoInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const objectUrl = URL.createObjectURL(file);
                  setPhotos((prev) => [
                    ...prev,
                    {
                      file,
                      url: objectUrl,
                    },
                  ]);
                  // Run OCR on documentation photo too
                  try {
                    const { data: { text } } = await Tesseract.recognize(file, 'eng');
                    const extractContainerNumber = (rawText) => {
                      const clean = rawText.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      let bestMatch = null;
                      let bestScore = -1;

                      for (let i = 0; i <= clean.length - 11; i++) {
                        const candidate = clean.substring(i, i + 11);
                        const prefix = candidate.substring(0, 4);
                        const suffix = candidate.substring(4, 11);
                        
                        const prefixLetters = (prefix.match(/[A-Z]/g) || []).length;
                        const suffixNumbers = (suffix.match(/[0-9]/g) || []).length;
                        
                        if (prefixLetters >= 3 && suffixNumbers >= 5) {
                          let score = prefixLetters + suffixNumbers;
                          if (['U', 'J', 'Z'].includes(prefix[3])) {
                            score += 2;
                          }
                          if (score > bestScore) {
                            bestScore = score;
                            bestMatch = candidate;
                          }
                        }
                      }
                      return bestMatch;
                    };

                    const detectedNumber = extractContainerNumber(text);
                    if (detectedNumber) {
                      setContainerNumber(detectedNumber);
                      
                      const found = manifestList.find(
                        (item) => item.container?.toString().toUpperCase().trim() === detectedNumber
                      );
                      if (found) {
                        setShipName(found.shipName || "");
                        setStatus(found.status || "");
                        setIso(found.iso || "");
                        setCategory(found.category || "");
                      }
                      alert(`Nomor kontainer otomatis terdeteksi dari foto: ${detectedNumber}\n\n(Mohon periksa kembali jika ada huruf/angka yang kurang tepat)`);
                    } else {
                      const snippet = text.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
                      alert(`Nomor kontainer tidak ditemukan pada foto. Silakan foto ulang.\n(Teks terbaca: ${snippet}...)`);
                    }
                  } catch (err) {
                    console.error("OCR Error:", err);
                  }
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* DIAGRAM INTERAKTIF KONTENER */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>
              Visual Sisi Kerusakan (Klik area pada diagram untuk memilih)
            </label>
            <div className="interactive-diagram-container">
              <img
                src="/container-diagram.png"
                alt="Container Damage Diagram"
                className="interactive-diagram-image"
              />
              {[
                { val: "Front/Depan", label: "Front (Depan)", x: 12, y: 30 },
                {
                  val: "Left Side/Sisi Kiri",
                  label: "Left Side (Kiri)",
                  x: 28,
                  y: 45,
                },
                { val: "Bottom/Bawah", label: "Bottom (Bawah)", x: 18, y: 75 },
                { val: "Inside/Dalam", label: "Inside (Dalam)", x: 50, y: 58 },
                { val: "Roof/Atas", label: "Roof (Atas)", x: 80, y: 26 },
                {
                  val: "Right Side/Sisi Kanan",
                  label: "Right Side (Kanan)",
                  x: 88,
                  y: 48,
                },
                {
                  val: "Rear/Belakang",
                  label: "Rear/Doors (Belakang)",
                  x: 71,
                  y: 60,
                },
              ].map((hotspot) => {
                const isChecked = selectedSides.includes(hotspot.val);
                const isDisabled =
                  selectedConditions.includes("Good") ||
                  selectedConditions.includes("GOOD");
                return (
                  <div
                    key={hotspot.val}
                    className="diagram-hotspot"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    onClick={() =>
                      !isDisabled &&
                      !isUploading &&
                      handleSideToggle(hotspot.val)
                    }
                  >
                    <div
                      className={`hotspot-badge ${isChecked ? "checked" : ""}`}
                    >
                      {isChecked ? "✓" : "!"}
                    </div>
                    <span className="hotspot-label">{hotspot.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHECKLIST SISI & KONDISI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* KONDISI */}
            <div className="form-group">
              <select
                value={selectedConditions[0] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "GOOD" || val === "Good") {
                    setSelectedConditions(["GOOD"]);
                    setSelectedSides([]);
                  } else {
                    setSelectedConditions([val]);
                  }
                }}
                className="form-select"
                disabled={isUploading}
              >
                <option value="">Ceklis Kondisi Kontainer</option>
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
                  { val: "Leaking/Bocor", label: "Leaking/Bocor" },
                ].map((c) => (
                  <option key={c.val} value={c.val}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SISI */}
            <div className="form-group">
              <select
                value={selectedSides[0] || ""}
                onChange={(e) => setSelectedSides([e.target.value])}
                className="form-select"
                disabled={
                  isUploading ||
                  selectedConditions.includes("Good") ||
                  selectedConditions.includes("GOOD")
                }
              >
                <option value="">Ceklis Sisi Kerusakan</option>
                {[
                  "Front/Depan",
                  "Rear/Belakang",
                  "Left Side/Sisi Kiri",
                  "Right Side/Sisi Kanan",
                  "Roof/Atas",
                  "Bottom/Bawah",
                  "Inside/Dalam",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
