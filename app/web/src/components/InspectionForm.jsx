import React, { useState, useEffect, useRef } from "react";
import { Loader2, Camera, Save, ArrowLeft } from "lucide-react";
import SearchSelect, { ISO_CODES, CATEGORIES } from "./SearchSelect";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { getGeminiApiKey, scanContainerWithGemini } from "../utils/geminiOcr";
import { compressImage, compressImageToBase64 } from "../utils/imageUtils";
import API_URL from "../config/api";
import Toast from "./Toast";

const COND_OPTIONS = ["Good", "Dented/Penyok", "Torn/Robek", "Hole/Lubang", "Rusty/Karat", "Bulging/Menonjol", "Peeling/Terkelupas"];
const SIDE_OPTIONS = ["Front/Depan", "Rear/Belakang", "Right Side/Sisi Kanan", "Left Side/Sisi Kiri", "Roof/Atas", "Bottom/Bawah", "Inside/Dalam", "Doors/Pintu", "Door Rods/Gagang Pintu", "Corner Castings"];

export default function InspectionForm({ user, manifestList, onSaveSuccess, onBack }) {
  const [container, setContainer] = useState("");
  const [shipName, setShipName] = useState("");
  const [status, setStatus] = useState("");
  const [iso, setIso] = useState("");
  const [category, setCategory] = useState("");
  const [selectedConditions, setSelectedConditions] = useState(["Good"]);
  const [selectedSides, setSelectedSides] = useState([]);
  const [note, setNote] = useState("");
  const [photosList, setPhotosList] = useState([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [toast, setToast] = useState({ message: "", type: "" });
  
  const containerInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleContainerChange = (e) => {
    const val = e.target.value.toUpperCase();
    setContainer(val);
    if (val.length >= 4) {
      cariContainer(val);
    }
  };

  const cariContainer = (nomor) => {
    const found = manifestList.find((m) => m.container === nomor);
    if (found) {
      setShipName(found.shipName || "");
      setStatus(found.status || "");
      if (found.iso) {
        const matchingIso = ISO_CODES.find((i) => i.startsWith(found.iso));
        if (matchingIso) setIso(matchingIso);
      }
      setCategory(found.category || "");
      showToast("Data manifest ditemukan", "success");
    } else {
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
      if (nomor.length >= 10) {
         showToast("Nomor container tidak ditemukan di manifest.", "error");
      }
    }
  };

  const validateForm = () => {
    if (!container.trim()) {
      showToast("Harap masukkan nomor container!", "error");
      containerInputRef.current?.focus();
      return false;
    }
    if (photosList.length === 0) {
      showToast("Harap ambil atau unggah minimal 1 foto formulir CDR!", "error");
      photoInputRef.current?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const simpanData = async () => {
    if (!validateForm()) return;

    setIsUploading(true);

    try {
      const uploadedUrls = [];
      const base64Results = await Promise.all(
        photosList.map(async (photoObj) => {
          if (photoObj.file) {
            return await new Promise((resolve) => {
              compressImageToBase64(photoObj.file, resolve);
            });
          }
          return photoObj.url;
        })
      );
      uploadedUrls.push(...base64Results.filter(r => r)); // filter out nulls
      const uploadedPhotoUrl = uploadedUrls.join("|");

      const activeUser = JSON.parse(localStorage.getItem("user")) || user;

      const dataToSave = {
        container: container.toUpperCase().trim(),
        shipName: shipName || "-",
        status: status || "-",
        iso: iso && iso !== "-ISO Code-" ? iso.split(" - ")[0] : "-",
        category: category || "-",
        condition: selectedConditions.length > 0 ? selectedConditions.join(", ") : "Good",
        side: selectedSides.length > 0 ? selectedSides.join(", ") : "General",
        note: note,
        photo1: uploadedPhotoUrl,
        photo2: "",
        petugas: activeUser?.nama || "Petugas Lapangan",
        group: activeUser?.group || "",
        date: currentTime.toISOString(),
      };

      const response = await fetch(`${API_URL}/api/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
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

      showToast("Data inspeksi berhasil disimpan", "success");
      
      // Notify parent to update local history
      if (onSaveSuccess) {
         onSaveSuccess({ ...dataToSave, photo1: "", photo2: "" }); // Send without massive base64 for lightweight history state
      }

      // Reset form
      setContainer("");
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
      setSelectedConditions(["Good"]);
      setSelectedSides([]);
      setNote("");
      setPhotosList([]);

    } catch (err) {
      console.error("Save error:", err);
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsScanning(true);
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        e.target.value = "";
        setIsScanning(false);
        return;
      }
      
      const compressedBlob = await compressImage(file);
      const detectedNumber = await scanContainerWithGemini(compressedBlob, apiKey);
      
      if (detectedNumber && !detectedNumber.startsWith("DEBUG_RAW")) {
        setContainer(detectedNumber);
        cariContainer(detectedNumber);
      } else {
        const debugText = detectedNumber ? detectedNumber.replace("DEBUG_RAW: ", "") : "";
        showToast(`Container tidak terdeteksi. (${debugText})`, "error");
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      showToast("Gagal memproses foto OCR", "error");
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  const handlePhotoAdd = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotosList((prev) => [...prev, { file, url: objectUrl }]);
      e.target.value = "";

      // Silent OCR background attempt
      try {
        const apiKey = getGeminiApiKey();
        if (apiKey && !container) {
          const compressedBlob = await compressImage(file);
          const detectedNumber = await scanContainerWithGemini(compressedBlob, apiKey);
          if (detectedNumber && !detectedNumber.startsWith("DEBUG_RAW")) {
            setContainer(detectedNumber);
            cariContainer(detectedNumber);
            showToast(`Auto-detect: ${detectedNumber}`, "success");
          }
        }
      } catch (err) {
         console.warn("Silent OCR failed", err);
      }
    }
  };

  return (
    <div className="inspection-card w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 mb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />
      
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          📝 Form Inspeksi CDR
        </h2>
        <button onClick={onBack} disabled={isUploading} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* ROW 1: Container & Scan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nomor Container <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                ref={containerInputRef}
                type="text"
                value={container}
                onChange={handleContainerChange}
                placeholder="Misal: TGHU1234567"
                className="flex-1 w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-semibold"
                disabled={isUploading}
              />
              <button
                onClick={() => !isUploading && !isScanning && document.getElementById("ocrContainerInput").click()}
                disabled={isUploading || isScanning}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                <span className="hidden sm:inline">Scan</span>
              </button>
              <input
                id="ocrContainerInput"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                disabled={isUploading}
                onChange={handleScan}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Kapal (Otomatis)</label>
            <input
              type="text"
              value={shipName}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* ROW 2: Status & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status (Full/Empty)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isUploading}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="">- Pilih Status -</option>
              <option value="FULL">FULL</option>
              <option value="EMPTY">EMPTY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <SearchSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={CATEGORIES}
              placeholder="Pilih Kategori (mis. DRY)"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* ROW 3: ISO & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ISO Code</label>
            <SearchSelect
              value={iso}
              onChange={(val) => setIso(val)}
              options={ISO_CODES}
              placeholder="-Pilih ISO Code-"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Waktu & Tanggal Inspeksi</label>
            <input
              type="text"
              value={currentTime.toLocaleString("id-ID", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
              }) + " WIB"}
              disabled
              className="w-full border border-slate-200 bg-blue-50/30 text-blue-800 rounded-lg px-4 py-3 font-bold cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">*Terekam otomatis saat Anda klik Simpan.</p>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* PHOTOS SECTION */}
        <div ref={photoInputRef}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Foto Dokumentasi / Detail Kerusakan <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar">
            {photosList.map((photo, idx) => (
              <div key={idx} className="relative w-28 h-28 rounded-xl border-2 border-slate-200 overflow-hidden shrink-0 group">
                <img src={photo.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-red-600 transition-all"
                  onClick={() => setPhotosList((prev) => prev.filter((_, i) => i !== idx))}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              onClick={() => !isUploading && document.getElementById("cdrPhotoInput").click()}
              disabled={isUploading}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={24} className="mb-1" />
              <span className="text-xs font-bold">Tambah Foto</span>
            </button>
            <input
              id="cdrPhotoInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              disabled={isUploading}
              onChange={handlePhotoAdd}
            />
          </div>
        </div>

        {/* CONDITIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kondisi / Tipe Kerusakan</label>
            <MultiSelectDropdown
              options={COND_OPTIONS}
              selectedValues={selectedConditions}
              onChange={(newVals) => setSelectedConditions(newVals)}
              placeholder="- Pilih Kondisi -"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Sisi Kerusakan</label>
            <MultiSelectDropdown
              options={SIDE_OPTIONS}
              selectedValues={selectedSides}
              onChange={(newVals) => setSelectedSides(newVals)}
              placeholder="- Pilih Sisi -"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* DIAGRAM */}
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
           <img
             src="/container-diagram.png"
             alt="Diagram Sisi Container"
             className="w-full object-contain max-h-[250px]"
             onError={(e) => {
               e.target.style.display = 'none'; // hide if not found locally
             }}
           />
        </div>

        {/* KRONOLOGI */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Kronologi / Detail Lainnya</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tuliskan detail kerusakan..."
            rows="3"
            disabled={isUploading}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          ></textarea>
        </div>

      </div>
      
      {/* FOOTER / SUBMIT */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
        <button
          onClick={simpanData}
          disabled={isUploading || isScanning}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto shadow-sm"
        >
          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Simpan Inspeksi CDR</span>
        </button>
      </div>

    </div>
  );
}
