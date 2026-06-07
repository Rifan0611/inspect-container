import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Camera, Image as ImageIcon, ArrowLeft } from "lucide-react";
import API_URL from "../config/api";
import "./Inspection.css";

export default function Inspection() {
  const navigate = useNavigate();

  const [containerNumber, setContainerNumber] = useState("");
  const [shipName, setShipName] = useState("");
  const [damage, setDamage] = useState("Good");
  const [side, setSide] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState([]);
  const [manifestList, setManifestList] = useState([]);
  useEffect(() => {

  console.log("MANIFEST LOADED:", manifestList);

}, [manifestList]);
const [status, setStatus] = useState("");
const [iso, setIso] = useState("");
const [category, setCategory] = useState("");
useEffect(() => {
  console.log("STATUS STATE:", status);
  console.log("ISO STATE:", iso);
  console.log("CATEGORY STATE:", category);
}, [status, iso, category]);

 useEffect(() => {

  loadManifest();

}, []);

const loadManifest = async () => {

  try {

    const response =
    await fetch(
  `${API_URL}/api/manifest`
);

    const data =
    await response.json();

    console.log(
      "DATA SERVER =",
      data
    );

    setManifestList(data);

  } catch(err){

    console.error(
      "ERROR LOAD MANIFEST",
      err
    );
    console.error("ERROR LOAD MANIFEST", err);
  }
};

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

const handleSearchContainer = async () => {
  if (!containerNumber.trim()) {
    alert("Harap masukkan nomor container terlebih dahulu!");
    return;
  }

  const value = containerNumber.toUpperCase().trim();

  try {
    const response = await fetch(`${API_URL}/api/manifest`);
    const data = await response.json();
    setManifestList(data);

    const found = data.find(
      (item) => item.container?.toString().toUpperCase().trim() === value
    );

    if (found) {
      setShipName(found.shipName || "");
      setStatus(found.status || "");
      setIso(found.iso || "");
      setCategory(found.category || "");
      alert("Data container ditemukan!");
    } else {
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
      alert("Nomor container tidak ditemukan di manifest. Harap pastikan manifest sudah di-import di dashboard.");
    }
  } catch (err) {
    console.error("ERROR SEARCHING CONTAINER", err);
    alert("Gagal mengambil data manifest terbaru dari server.");
  }
};

const saveInspection = () => {
  if (!containerNumber) {
    alert("Harap pilih nomor container!");
    return;
  }

  const activeUser = JSON.parse(localStorage.getItem("user"));

  const data = {
    container: containerNumber,
    shipName: shipName,
    status: status,
    iso: iso,
    category: category,
    condition: damage,
    side: side,
    note: note,
    photo1: photos[0]?.url || "",
    photo2: photos[1]?.url || "",
    petugas: activeUser?.nama || "Petugas Lapangan",
    date: new Date().toISOString()
  };

  const newHistory = [
    ...(JSON.parse(localStorage.getItem("history")) || []),
    data
  ];

  localStorage.setItem("history", JSON.stringify(newHistory));

  // Trigger event agar dashboard di tab yang sama bisa refresh otomatis
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("focus"));

  alert("INSPEKSI BERHASIL TERSIMPAN");
  navigate("/history");
};

return (
  <div className="inspection-container-page">
    <div className="inspection-wrapper">
      
      {/* BANNER KUNING */}
      <div className="form-header-banner">
        FORM PETUGAS (INSPEKSI)
      </div>

      {/* CARD UTAMA */}
      <div className="inspection-card">
        <div className="form-grid">
          
          {/* KOLOM KIRI */}
          <div className="form-column">
            <div className="form-group">
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
                  placeholder="Masukkan nomor container"
                  className="form-input"
                />
                <button
                  type="button"
                  className="btn-search-container"
                  onClick={handleSearchContainer}
                >
                  Cari
                </button>
              </div>
              <datalist id="containerList">
                {manifestList.map((item, index) => (
                  <option key={index} value={item.container} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Sisi</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="form-select"
              >
                <option value="">- Pilih Sisi -</option>
                <option value="Front">Front</option>
                <option value="Rear">Rear</option>
                <option value="Left Side">Left Side</option>
                <option value="Right Side">Right Side</option>
                <option value="Top Side">Top Side</option>
                <option value="Bottom Side">Bottom Side</option>
              </select>
            </div>

            <div className="form-group">
              <label>Kondisi</label>
              <select
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                className="form-select"
              >
                <option value="Good">Good</option>
                <option value="Dent/Penyok">Dent/Penyok</option>
                <option value="Hole/Lubang">Hole/Lubang</option>
                <option value="Rust/Karat">Rust/Karat</option>
                <option value="Broken/Pecah">Broken/Pecah</option>
                <option value="Other/Lainnya">Other/Lainnya</option>
              </select>
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="form-column">
            <div className="form-group">
              <label>Nama Kapal</label>
              <input
                type="text"
                value={shipName}
                readOnly
                placeholder="Nama kapal otomatis terisi..."
                className="form-input-readonly"
              />
            </div>

            <div className="form-group">
              <label>FULL / EMPTY</label>
              <input
                type="text"
                value={status}
                readOnly
                placeholder="Status otomatis terisi..."
                className="form-input-readonly"
              />
            </div>

            <div className="form-group">
              <label>ISO CODE</label>
              <input
                type="text"
                value={iso}
                readOnly
                placeholder="ISO code otomatis terisi..."
                className="form-input-readonly"
              />
            </div>

            <div className="form-group">
              <label>CATEGORY</label>
              <input
                type="text"
                value={category}
                readOnly
                placeholder="Category otomatis terisi..."
                className="form-input-readonly"
              />
            </div>
          </div>

        </div>

        {/* CATATAN */}
        <div className="form-group full-width">
          <label>Catatan</label>
          <textarea
            placeholder="Catatan inspeksi..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-textarea"
          />
        </div>

        {/* MEDIA UPLOAD SECTION */}
        <div className="media-section">
          <h4 className="media-title">Foto Kerusakan (Opsional)</h4>
          <div className="media-actions">
            <button
              type="button"
              onClick={() => document.getElementById("cameraInput").click()}
              className="btn-media-blue"
            >
              <Camera size={18} />
              <span>Ambil Foto Kamera</span>
            </button>
            <input
              id="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const mapped = files.map(file => ({
                  file,
                  url: URL.createObjectURL(file)
                }));
                setPhotos(prev => [...prev, ...mapped]);
              }}
            />

            <button
              type="button"
              onClick={() => document.getElementById("galleryInput").click()}
              className="btn-media-orange"
            >
              <ImageIcon size={18} />
              <span>Ambil dari Galeri</span>
            </button>
            <input
              id="galleryInput"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const mapped = files.map(file => ({
                  file,
                  url: URL.createObjectURL(file)
                }));
                setPhotos(prev => [...prev, ...mapped]);
              }}
            />
          </div>

          {/* PREVIEW FOTO */}
          {photos.length > 0 && (
            <div className="photos-preview-grid">
              {photos.map((item, index) => (
                <div key={index} className="photo-preview-item">
                  <img src={item.url} alt="preview" />
                  <button
                    type="button"
                    className="btn-delete-photo"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== index))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BUTTON ACTIONS */}
        <div className="form-footer-buttons">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </button>
          
          <button
            type="button"
            className="btn-save-inspection"
            onClick={saveInspection}
          >
            <Save size={18} />
            <span>Simpan Inspeksi</span>
          </button>
        </div>

      </div>

    </div>
  </div>
);
}