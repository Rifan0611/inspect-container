import OfficeDashboard from "./pages/office-dashboard/OfficeDashboard";
import API_URL from "./config/api";
import React, { useState } from "react";
import "./pages/Inspection.css";
import { Save, Camera, ArrowLeft, Loader2, Image, FileText } from "lucide-react";
import SearchSelect, { ISO_CODES, CATEGORIES } from "./components/SearchSelect";
import MultiSelectDropdown from "./components/MultiSelectDropdown";

import * as XLSX from "xlsx";
import { getGeminiApiKey, scanContainerWithGemini } from "./utils/geminiOcr";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const compressImageToBase64 = (file, callback) => {
  if (!file || !(file instanceof Blob)) {
    return callback(null);
  }
  
  const timeoutId = setTimeout(() => {
    console.error("compressImageToBase64 timeout");
    callback(null);
  }, 10000); // 10 seconds timeout

  const cleanup = () => clearTimeout(timeoutId);

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 600;
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
      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
      
      URL.revokeObjectURL(objectUrl);
      cleanup();
      callback(dataUrl);
    } catch(e) {
      URL.revokeObjectURL(objectUrl);
      cleanup();
      callback(null);
    }
  };
  
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    cleanup();
    callback(null);
  }

  img.src = objectUrl;
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



const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      return resolve(file);
    }
    
    const timeoutId = setTimeout(() => {
      console.error("compressImage timeout");
      resolve(file);
    }, 10000);

    const cleanup = () => clearTimeout(timeoutId);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
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
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            cleanup();
            resolve(blob || file);
          },
          "image/jpeg",
          0.7,
        );
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        cleanup();
        resolve(file);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      cleanup();
      resolve(file);
    }
    
    img.src = objectUrl;
  });
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            background: "#fee2e2",
            color: "#991b1b",
            minHeight: "100vh",
            fontFamily: "monospace",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Aplikasi Error (Crash)
          </h2>
          <p style={{ fontWeight: "bold" }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <pre
            style={{
              marginTop: "20px",
              background: "#fff",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: "12px",
              border: "1px solid #fca5a5",
            }}
          >
            {this.state.error && this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reload Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const parsePhotos = (photoStr) => {
  if (!photoStr) return [];
  if (photoStr.includes("|")) return photoStr.split("|");
  if (photoStr.startsWith("data:image")) return [photoStr];
  return photoStr.split(",");
};

export default function App() {
  const formatInspectionDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let str = d.toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      str = str
        .replace(/\bpukul\b/i, "")
        .replace(/\s+/g, " ")
        .trim();
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (str.startsWith(day) && !str.startsWith(day + ",")) {
          str = str.replace(day, day + ",");
          break;
        }
      }
      return `${str} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionDatePDF = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (datePart.startsWith(day) && !datePart.startsWith(day + ",")) {
          datePart = datePart.replace(day, day + ",");
          break;
        }
      }
      const timePart = d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(":", ".");
      return `${datePart}<br/>${timePart} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionDatePart = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      for (const day of days) {
        if (datePart.startsWith(day) && !datePart.startsWith(day + ",")) {
          datePart = datePart.replace(day, day + ",");
          break;
        }
      }
      return datePart;
    } catch (e) {
      return dateStr;
    }
  };

  const formatInspectionTimePart = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const timePart = d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(":", ".");
      return `${timePart} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  // ======================================================
  // STATE
  // ======================================================

  const [page, setPage] = useState("login");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState("");

  const [manifestShipName] = useState("-");

  const [manifestData, setManifestData] = useState(() => {
    try {
      const val = localStorage.getItem("manifestData");
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [container, setContainer] = useState("");

  const [shipName, setShipName] = useState("");

  const [status, setStatus] = useState("");

  const [iso, setIso] = useState("");

  const [category, setCategory] = useState("");

  const [photo1, setPhoto1] = useState("");

  const [photo2, setPhoto2] = useState("");

  const [search, setSearch] = useState("");

  const [condition, setCondition] = useState("GOOD");

  const [side, setSide] = useState("");

  const [note, setNote] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      const val = localStorage.getItem("history");
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manifestList, setManifestList] = useState([]);
  const [inspectedContainers, setInspectedContainers] = useState([]);
  const [cdrFile, setCdrFile] = useState(null);
  const [photosList, setPhotosList] = useState([]);
  const [selectedSides, setSelectedSides] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);

  // ======================================================
  // USER MANAGEMENT
  // ======================================================

  const users = [
    {
      name: "Andi Saputra",
      role: "MANAGER",
      group: "Management",
      status: "Online",
    },

    {
      name: "Budi Santoso",
      role: "SUPERVISOR",
      group: "Shift A",
      status: "Online",
    },

    {
      name: "Rizky Hidayat",
      role: "ASSISTANT SUPERVISOR",
      group: "Shift B",
      status: "Online",
    },

    {
      name: "Doni Pratama",
      role: "PETUGAS",
      group: "Lapangan A",
      status: "Online",
    },

    {
      name: "Fajar Nugraha",
      role: "PETUGAS",
      group: "Lapangan B",
      status: "Offline",
    },

    {
      name: "Yusuf Maulana",
      role: "PETUGAS",
      group: "Gate In",
      status: "Online",
    },
  ];

  const grafikData = [
    { tanggal: "01/05", total: 40 },
    { tanggal: "05/05", total: 70 },
    { tanggal: "10/05", total: 50 },
    { tanggal: "15/05", total: 90 },
    { tanggal: "20/05", total: 65 },
    { tanggal: "24/05", total: 80 },
  ];

  const pieData = [
    { name: "Dented", value: 38 },
    { name: "Bent", value: 22 },
    { name: "Broken", value: 12 },
    { name: "Hole", value: 8 },
    { name: "Others", value: 20 },
  ];

  const pieColors = ["#2F80ED", "#EB5757", "#F2C94C", "#27AE60", "#BDBDBD"];

  // ======================================================
  // LOGIN
  // ======================================================

  const [user, setUser] = useState(null);

  React.useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const fetchAndMigrateInspections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inspection`);
      const dbInspections = await response.json();

      if (Array.isArray(dbInspections)) {
        const rawHistory = localStorage.getItem("history");
        let localHistory = [];
        try {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed)) localHistory = parsed;
        } catch (e) {}

        // Find inspections in local storage that are NOT in the database
        const missingInDb = localHistory.filter(
          (localIns) =>
            !dbInspections.some(
              (dbIns) =>
                String(dbIns.container).toUpperCase().trim() ===
                  String(localIns.container).toUpperCase().trim() &&
                Math.abs(
                  new Date(dbIns.date).getTime() -
                    new Date(localIns.date).getTime(),
                ) < 5000,
            ),
        );

        if (missingInDb.length > 0) {
          console.log("Migrating local inspections to database:", missingInDb);
          for (const ins of missingInDb) {
            try {
              await fetch(`${API_URL}/api/inspection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ins),
              });
            } catch (e) {
              console.error("Failed to migrate inspection:", ins.container, e);
            }
          }

          // Re-fetch updated list from DB after migration
          const updatedResponse = await fetch(`${API_URL}/api/inspection`);
          const updatedDbInspections = await updatedResponse.json();
          if (Array.isArray(updatedDbInspections)) {
            setHistory(updatedDbInspections);
            localStorage.setItem(
              "history",
              JSON.stringify(updatedDbInspections),
            );
            return;
          }
        }

        setHistory(dbInspections);
        localStorage.setItem("history", JSON.stringify(dbInspections));
      }
    } catch (err) {
      console.error("Failed to sync inspections with database:", err);
    }
  };

  const loadManifestAndInspections = async () => {
    try {
      const manifestRes = await fetch(`${API_URL}/api/manifest`);
      const manifestData = await manifestRes.json();
      if (Array.isArray(manifestData)) {
        setManifestList(manifestData);
      }

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

  React.useEffect(() => {
    loadManifestAndInspections();
    fetchAndMigrateInspections();
  }, [page]);

  const availableContainers = manifestList.filter((item) => {
    const containerNum = item.container?.toString().toUpperCase().trim();
    if (!containerNum) return false;

    const isAlreadyInspected = inspectedContainers.includes(containerNum);
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
    setContainer(value);

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

  const handleSearchContainer = () => {
    if (!container.trim()) {
      alert("Harap masukkan nomor container terlebih dahulu!");
      return;
    }
    const found = availableContainers.find(
      (item) => item.container?.toString().toUpperCase().trim() === container,
    );

    if (found) {
      alert("Data container ditemukan!");
    } else {
      const inManifest = manifestList.find(
        (item) => item.container?.toString().toUpperCase().trim() === container,
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
            `Container ${container} tidak dapat diinspeksi karena statusnya sudah "${inManifest.status}" (Muat/Keluar).`,
          );
        } else {
          alert(`Container ${container} sudah pernah diinspeksi sebelumnya.`);
        }
      } else {
        alert("Nomor container tidak ditemukan di manifest.");
      }
    }
  };

  const handleSideChange = (val) => {
    setSide(val);
  };

  const handleConditionChange = (val) => {
    setCondition(val);
    if (val === "GOOD") {
      setSide("");
    }
  };

  const login = async () => {
    const currentHour = new Date().getHours();
    const activeShift = currentHour >= 8 && currentHour < 20 ? "PAGI" : "MALAM";

    // Fetch latest accounts from backend database so mobile/remote logins work immediately
    let storedAccounts = [];
    try {
      const response = await fetch(`${API_URL}/api/accounts`);
      const dbData = await response.json();
      if (Array.isArray(dbData)) {
        // Migrate local storage accounts that aren't in the database yet
        const rawAccounts = localStorage.getItem("accounts");
        let localAccounts = [];
        try {
          const parsed = JSON.parse(rawAccounts);
          if (Array.isArray(parsed)) localAccounts = parsed;
        } catch (e) {}
        const missing = localAccounts.filter(
          (local) =>
            !dbData.some(
              (db) =>
                db.username.toLowerCase().trim() ===
                local.username.toLowerCase().trim(),
            ),
        );

        if (missing.length > 0) {
          console.log("Migrating local accounts to MySQL:", missing);
          for (const acc of missing) {
            try {
              await fetch(`${API_URL}/api/accounts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: acc.username,
                  password: acc.password,
                  jabatan: acc.jabatan,
                  nama: acc.nama || acc.username,
                  group: acc.group || "Office",
                }),
              });
            } catch (e) {
              console.error("Migration error for", acc.username, e);
            }
          }
          // Refetch after migrating
          const refetchRes = await fetch(`${API_URL}/api/accounts`);
          const refetchData = await refetchRes.json();
          if (Array.isArray(refetchData)) {
            storedAccounts = refetchData;
            localStorage.setItem("accounts", JSON.stringify(refetchData));
          } else {
            storedAccounts = dbData;
            localStorage.setItem("accounts", JSON.stringify(dbData));
          }
        } else {
          storedAccounts = dbData;
          localStorage.setItem("accounts", JSON.stringify(dbData));
        }
      } else {
        storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
      }
    } catch (err) {
      console.error("Failed to fetch latest accounts, using cache:", err);
      storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    }

    // MANAGER
    if (username === "manager" && password === "123") {
      const dataUser = {
        nama: "Rian Agung",
        role: "MANAGER",
        username: "manager",
        shift: activeShift,
        group: "Management",
      };

      setUser(dataUser);
      setRole("MANAGER");
      setPage("dashboard");
      return;
    }

    // SUPERVISOR
    if (username === "supervisor" && password === "123") {
      const dataUser = {
        nama: "Budi Santoso",
        role: "SUPERVISOR",
        username: "supervisor",
        shift: activeShift,
        group: "Shift A",
      };

      setUser(dataUser);
      setRole("SUPERVISOR");
      setPage("dashboard");
      return;
    }

    // ASSISTANT
    if (username === "assistant" && password === "123") {
      const dataUser = {
        nama: "Andi Wijaya",
        role: "ASSISTANT SUPERVISOR",
        username: "assistant",
        shift: activeShift,
        group: "Shift B",
      };

      setUser(dataUser);
      setRole("ASSISTANT SUPERVISOR");
      setPage("dashboard");
      return;
    }

    // ADMIN
    if (username === "adminRAL" && password === "Rifan0611") {
      const dataUser = {
        nama: "Admin NPH",
        role: "ADMIN",
        username: "adminRAL",
        shift: activeShift,
        group: "Office",
      };

      setUser(dataUser);
      setRole("ADMIN");
      setPage("dashboard");
      return;
    }

    // PETUGAS
    if (username === "petugas" && password === "123") {
      const dataUser = {
        nama: "Petugas Lapangan",
        role: "PETUGAS",
        username: "petugas",
        shift: activeShift,
        group: "Lapangan",
      };

      setUser(dataUser);
      setRole("PETUGAS");
      setPage("dashboard");
      return;
    }

    // CHECK DYNAMIC ACCOUNTS FROM DATABASE / CACHE
    const matchedAccount = storedAccounts.find(
      (acc) =>
        acc.username.toLowerCase().trim() === username.toLowerCase().trim() &&
        acc.password === password,
    );

    if (matchedAccount) {
      const dataUser = {
        nama: matchedAccount.nama || matchedAccount.username,
        role: matchedAccount.jabatan,
        username: matchedAccount.username,
        shift: activeShift,
        group: matchedAccount.group || "Office",
      };

      setUser(dataUser);
      setRole(matchedAccount.jabatan);

      setPage("dashboard");
      return;
    }

    alert("USERNAME / PASSWORD SALAH");
  };

  // ======================================================
  // IMPORT MANIFEST
  // ======================================================

  const importExcel = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const dataBuffer = evt.target.result;

      const workbook = XLSX.read(dataBuffer, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      const finalData = data.map((item) => ({
        ...item,

        shipName: manifestShipName,
      }));

      setManifestData(finalData);

      localStorage.setItem("manifestData", JSON.stringify(finalData));

      alert("MANIFEST BERHASIL IMPORT");
    };

    reader.readAsArrayBuffer(file);
  };

  // ======================================================
  // AUTO CARI CONTAINER
  // ======================================================

  const cariContainer = (value) => {
    const upperValue = value.toUpperCase();

    setContainer(upperValue);

    const found = manifestData.find((item) => {
      const nomorContainer = String(
        item["CONTAINER"] ||
          item["Container"] ||
          item["NO CONTAINER"] ||
          item["NOMOR CONTAINER"] ||
          item["container"] ||
          "",
      ).toUpperCase();

      return nomorContainer === upperValue;
    });

    if (found) {
      setShipName(
        found.shipName ||
          found["VESSEL"] ||
          found["KAPAL"] ||
          found["SHIP"] ||
          found["Carrier"] ||
          "",
      );

      setStatus(
        found.status ||
          found["STATUS"] ||
          found["FULL/EMPTY"] ||
          found["FULL EMPTY"] ||
          "",
      );

      setIso(found.iso || found["ISO"] || found["ISO CODE"] || "");

      setCategory(found.category || found["CATEGORY"] || found["TYPE"] || "");
    } else {
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
    }
  };

  const cariContainerLive = async () => {
    if (!container.trim()) {
      alert("Harap masukkan nomor container terlebih dahulu!");
      return;
    }

    const value = container.toUpperCase().trim();
    try {
      const response = await fetch(`${API_URL}/api/manifest`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setManifestData(data);
        localStorage.setItem("manifestData", JSON.stringify(data));

        const found = data.find((item) => {
          const nomorContainer = String(
            item.container ||
              item["CONTAINER"] ||
              item["Container"] ||
              item["NO CONTAINER"] ||
              item["NOMOR CONTAINER"] ||
              "",
          )
            .toUpperCase()
            .trim();
          return nomorContainer === value;
        });

        if (found) {
          setShipName(
            found.shipName ||
              found["VESSEL"] ||
              found["KAPAL"] ||
              found["SHIP"] ||
              found["Carrier"] ||
              "",
          );
          setStatus(
            found.status ||
              found["STATUS"] ||
              found["FULL/EMPTY"] ||
              found["FULL EMPTY"] ||
              "",
          );
          setIso(found.iso || found["ISO"] || found["ISO CODE"] || "");
          setCategory(
            found.category || found["CATEGORY"] || found["TYPE"] || "",
          );
          alert("Data container ditemukan!");
        } else {
          setShipName("");
          setStatus("");
          setIso("");
          setCategory("");
          alert(
            "Nomor container tidak ditemukan di manifest. Harap pastikan manifest sudah di-import di dashboard.",
          );
        }
      } else {
        console.warn("Manifest data received from API is not an array:", data);
        alert("Gagal mengambil data manifest (format data tidak sesuai).");
      }
    } catch (err) {
      console.error("ERROR SEARCHING CONTAINER", err);
      alert("Gagal mengambil data manifest terbaru dari server.");
    }
  };

  // ======================================================
  // SAVE DATA
  // ======================================================

  const simpanData = async () => {
    if (!container.trim()) {
      alert("Harap masukkan nomor container!");
      return;
    }
    if (photosList.length === 0) {
      alert("Harap ambil atau unggah foto formulir CDR!");
      return;
    }

    setIsUploading(true);

    try {
      // Convert all photos to Base64 strings directly to avoid ephemeral Vercel storage deletion
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
        uploadedUrls.push(...base64Results);
        
        const uploadedPhotoUrl = uploadedUrls.join("|");

      const activeUser = JSON.parse(localStorage.getItem("user")) || user;

      const data = {
        container: container.toUpperCase().trim(),
        shipName: shipName || "-",
        status: status || "-",
        iso: iso && iso !== "-ISO Code-" ? iso.split(" - ")[0] : "-",
        category: category || "-",
        condition:
          selectedConditions.length > 0
            ? selectedConditions.join(", ")
            : "Good",
        side: selectedSides.length > 0 ? selectedSides.join(", ") : "General",
        note: note,
        photo1: uploadedPhotoUrl,
        photo2: "",
        petugas: activeUser?.nama || "Petugas Lapangan",
        group: activeUser?.group || "",
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

      const historyDataToSave = { ...data, photo1: "", photo2: "" };
      const newHistory = [historyDataToSave, ...history];
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory.slice(0, 5)));

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("focus"));

      alert("INSPEKSI CDR BERHASIL TERSIMPAN");

      // Reset form
      setContainer("");
      setShipName("");
      setStatus("");
      setIso("");
      setCategory("");
      setSelectedConditions(["Good"]);
      setSelectedSides([]);
      setNote("");
      setPhoto1("");
      setPhoto2("");
      setCdrFile(null);
      setPhotosList([]);

      setPage("history");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ======================================================
  // CETAK PDF
  // ======================================================

  const cetakPdf = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    win.document.write(`

<html>

<head>

<title>
BERITA ACARA
</title>

<style>

*{
box-sizing:border-box;
}

@page{
size:A4;
margin:10mm;
}

body{

font-family:Arial,sans-serif;
padding:12px;
font-size:10px;
color:#000;
margin:0;
background:#fff;
-webkit-print-color-adjust:exact;
print-color-adjust:exact;

}

.header{

display:flex;
justify-content:space-between;
align-items:flex-end;
border-bottom:3px solid #004aad;
padding-bottom:8px;
margin-bottom:12px;

}

.logo{

width:130px;
display:block;
margin-bottom:-4px;

}

.company{

text-align:right;

}

.company h2{

margin:0;
font-size:15px;
font-weight:bold;
color:#004aad;

}

.company p{

margin:1px 0;
font-size:9px;

}

.title{

text-align:center;
font-size:15px;
font-weight:bold;
margin:10px 0 15px 0;
letter-spacing:1px;

}

table{

width:100%;
border-collapse:collapse;
margin-bottom:12px;

}

td{

border:1px solid #000;
padding:6px;
font-size:10px;

}

.label{

font-weight:bold;
background:#f3f3f3;
width:35%;

}

.note-title{

font-weight:bold;
margin-bottom:6px;
margin-top:8px;
font-size:10px;

}

.note{

border:1px solid #000;
padding:8px;
height:80px;
font-size:10px;
margin-bottom:12px;

}

.photo-title{

font-weight:bold;
margin-bottom:10px;
font-size:10px;

}

.photo-grid{

display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
margin-bottom:20px;

}

.photo-box{

text-align:center;

}

.photo-label{

font-size:10px;
font-weight:bold;
margin-bottom:6px;

}

.photo-box img{

width:100%;
height:165px;
object-fit:cover;
border-radius:8px;
border:2px solid #004aad;

}

.footer{

display:flex;
justify-content:space-between;
margin-top:25px;

}

.ttd{

width:220px;
text-align:center;
font-size:10px;

}

.ttd-line{

margin-top:55px;

}

@media print{

html,body{

width:210mm;
height:297mm;
overflow:hidden;

}

}

</style>

</head>

<body>

<div class="header" style="justify-content: center; text-align: center;">

<div class="company" style="text-align: center; width: 100%;">

<h2>
NPH ADIPURUSA
</h2>

<p>
Container Inspection System
</p>

</div>

</div>

<div class="title">

BERITA ACARA CONTAINER INSPECTION

</div>

<table>

<tr>
<td class="label">
Nomor Container
</td>

<td>
${item.container || "-"}
</td>
</tr>

<tr>
<td class="label">
Status
</td>

<td>
${item.status || "-"}
</td>
</tr>

<tr>
<td class="label">
ISO
</td>

<td>
${item.iso || "-"}
</td>
</tr>

<tr>
<td class="label">
Category
</td>

<td>
${item.category || "-"}
</td>
</tr>

<tr>
<td class="label">
Kondisi
</td>

<td>
${item.condition || "-"}
</td>
</tr>

<tr>
<td class="label">
Sisi
</td>

<td>
${item.side || "-"}
</td>
</tr>

<tr>
<td class="label">
Hari & Tanggal
</td>

<td>
${formatInspectionDatePart(item.date)}
</td>

</tr>

<tr>
<td class="label">
Waktu
</td>

<td>
${formatInspectionTimePart(item.date)}
</td>

</tr>

<tr>
<td class="label">
Grup Petugas
</td>

<td>
${item.group || "Lapangan"}
</td>

</tr>

</table>

<div class="note-title">

CATATAN KRONOLOGI

</div>

<div class="note">

${item.note || "-"}

</div>



<div class="footer">

<div class="ttd">

<div>
Petugas Inspeksi
</div>

<div class="ttd-line">

( ${item.petugas || "Petugas Lapangan"} )

</div>

</div>

<div class="ttd">

<div>
Supervisor
</div>

<div class="ttd-line">

(................................)

</div>

</div>

</div>

<script>

window.onload = function(){
  var imgs = document.getElementsByTagName('img');
  if (imgs.length === 0) {
    window.print();
    return;
  }
  var loaded = 0;
  function checkDone() {
    loaded++;
    if (loaded === imgs.length) window.print();
  }
  for (var i = 0; i < imgs.length; i++) {
    if (imgs[i].complete) {
      loaded++;
    } else {
      imgs[i].addEventListener('load', checkDone);
      imgs[i].addEventListener('error', checkDone);
    }
  }
  if (loaded === imgs.length) window.print();
}

</script>

</body>

</html>

`);

    win.document.close();
  };

  const cetakFoto = (item) => {
    const win = window.open("", "", "width=1200,height=900");

    win.document.write(`
<html>
<head>
<title>BERITA ACARA - FOTO</title>
<style>
* { box-sizing:border-box; }
@page { size:A4; margin:10mm; }
body { font-family:Arial,sans-serif; padding:12px; font-size:10px; color:#000; margin:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #004aad; padding-bottom:8px; margin-bottom:12px; }
.logo { width:130px; display:block; margin-bottom:-4px; }
.company { text-align:right; }
.company h2 { margin:0; font-size:15px; font-weight:bold; color:#004aad; }
.company p { margin:1px 0; font-size:9px; }
.photo-title { font-weight:bold; margin-bottom:10px; font-size:10px; }
.photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; }
.photo-box { text-align:center; }
.photo-label { font-size:10px; font-weight:bold; margin-bottom:6px; }
.photo-box img { width:100%; height:165px; object-fit:cover; border-radius:8px; border:2px solid #004aad; }
@media print { html,body { width:210mm; height:297mm; overflow:hidden; } }
</style>
</head>
<body>
<div class="header" style="justify-content: center; text-align: center;">
<div class="company" style="text-align: center; width: 100%;">
<h2>NPH ADIPURUSA</h2>
<p>Container Inspection System</p>
</div>
</div>
<div class="photo-title">FOTO INSPEKSI - ${item.container || "-"}</div>
<div class="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
<div class="photo-box">
<div class="photo-label">FOTO DAMAGE</div>
${item.photo2 ? `<img src="${item.photo2}" />` : ""}
</div>
${parsePhotos(item.photo1)
  .map((url) => url.trim())
  .filter(Boolean)
  .map(
    (url, i) => `
  <div class="photo-box" style="text-align: center;">
    <div class="photo-label" style="font-size: 10px; font-weight: bold; margin-bottom: 6px;">FOTO CONTAINER/CDR ${i + 1}</div>
    <img src="${url}" style="width: 100%; height: 165px; object-fit: cover; border-radius: 8px; border: 2px solid #004aad;" />
  </div>
`,
  )
  .join("")}
</div>
<script>
window.onload = function() {
  var imgs = document.getElementsByTagName('img');
  if (imgs.length === 0) {
    window.print();
    return;
  }
  var loaded = 0;
  function checkDone() {
    loaded++;
    if (loaded === imgs.length) window.print();
  }
  for (var i = 0; i < imgs.length; i++) {
    if (imgs[i].complete) {
      loaded++;
    } else {
      imgs[i].addEventListener('load', checkDone);
      imgs[i].addEventListener('error', checkDone);
    }
  }
  if (loaded === imgs.length) window.print();
}
</script>
</body>
</html>
`);
    win.document.close();
  };


  // ======================================================
  // LOGIN PAGE
  // ======================================================

  if (page === "login") {
    return (
      <div style={bg}>
        <div style={card}>
          <img src="/logo.jpg" alt="Logo" style={{ margin: "0 auto 24px auto", display: "block", width: "120px" }} />

          <h1 style={title}>CONTAINER INSPECTION</h1>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button style={button} onClick={login}>
            LOGIN
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  if (page === "dashboard") {
    return (
      <div style={bg}>
        <div style={card}>
          <img src="/logo.jpg" alt="Logo" style={{ margin: "0 auto 24px auto", display: "block", width: "120px" }} />

          <h1 style={title}>DASHBOARD</h1>

          <h2 style={roleText}>
            {role === "PETUGAS" ? "PETUGAS LAPANGAN" : role}
          </h2>

          <button style={button} onClick={() => setPage("inspection")}>
            CONTAINER INSPECTION
          </button>

          <button style={button} onClick={() => setPage("history")}>
            RIWAYAT INSPEKSI
          </button>

          {(role === "MANAGER" ||
            role === "ADMIN" ||
            role === "SUPERVISOR" ||
            role === "ASSISTANT SUPERVISOR") && (
            <>
              <button style={button} onClick={() => setPage("manager")}>
                {role === "ADMIN"
                  ? "ADMIN CONTROL PANEL"
                  : `${role} CONTROL ROOM`}
              </button>

              <button
                style={{ ...button, background: "#0B1F3A" }}
                onClick={() => setPage("office-dashboard")}
              >
                DASHBOARD KANTOR
              </button>
            </>
          )}

          {role !== "PETUGAS" && (
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importExcel}
                style={input}
              />
            </div>
          )}

          {/* TABEL TRANSAKSI TERBARU */}
          <div
            style={{
              marginTop: "30px",
              borderTop: "1px solid #eee",
              paddingTop: "25px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#004aad",
                marginBottom: "15px",
                textAlign: "left",
              }}
            >
              Transaksi Inspeksi Terbaru
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 8px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      No
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Container
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Kapal
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Kondisi
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Sisi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((item, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: "10px 8px", color: "#334155" }}>
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          fontWeight: "700",
                          color: "#2563eb",
                        }}
                      >
                        {item.container}
                      </td>
                      <td style={{ padding: "10px 8px", color: "#334155" }}>
                        {item.shipName}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span
                          style={{
                            padding: "3px 6px",
                            borderRadius: "8px",
                            fontSize: "10px",
                            fontWeight: "700",
                            background:
                              item.condition === "Good" ||
                              item.condition === "GOOD"
                                ? "#dcfce7"
                                : "#ffe4e6",
                            color:
                              item.condition === "Good" ||
                              item.condition === "GOOD"
                                ? "#15803d"
                                : "#b91c1c",
                          }}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px", color: "#475569" }}>
                        {item.side || "General"}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "20px 8px",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        Belum ada riwayat transaksi inspeksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button style={logoutButton} onClick={() => setPage("login")}>
            LOGOUT
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // INSPECTION PAGE
  // ======================================================

  if (page === "inspection") {
    return (
      <div className="inspection-container-page">
        <div className="inspection-wrapper">
          {/* BANNER KUNING */}
          <div className="form-header-banner">FORM PETUGAS (INSPEKSI CDR)</div>

          {/* CARD UTAMA */}
          <div className="inspection-card">
            {/* NOMOR CONTAINER */}
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label>
                  Nomor Container
                  <span className="required-star">*</span>
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={container}
                    onChange={handleContainerChange}
                    placeholder="Masukkan nomor container..."
                    className="form-input"
                    disabled={isUploading}
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button
                    onClick={() => !isUploading && !isScanning && document.getElementById("ocrContainerInput").click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 16px",
                      height: "46px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      flexShrink: 0
                    }}
                    disabled={isUploading || isScanning}
                  >
                    {isScanning ? <Loader2 className="animate-spin" size={16} /> : "📷 Scan"}
                  </button>
                  <input
                    id="ocrContainerInput"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    disabled={isUploading}
                    onChange={async (e) => {
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
                          
                          if (typeof handleContainerChange === 'function') {
                            handleContainerChange({ target: { value: detectedNumber } });
                          } else if (typeof cariContainer === 'function') {
                            cariContainer(detectedNumber);
                          }
                        } else {
                          const debugText = detectedNumber ? detectedNumber.replace("DEBUG_RAW: ", "") : "";
                          alert(`Nomor kontainer tidak ditemukan pada foto oleh Gemini Vision.\n(Teks terbaca: ${debugText}...)\nPastikan foto cukup jelas dan coba lagi.`);
                        }
                      } catch (err) {
                        console.error("Gemini Error:", err);
                        alert("Terjadi kesalahan saat memproses foto menggunakan Gemini API.\n" + (err.message || ""));
                      } finally {
                        setIsScanning(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* METADATA INPUTS */}
            <div className="form-grid">
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

            <div className="form-grid">
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
                {photosList.map((photo, idx) => (
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
                        setPhotosList((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
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
                    setPhotosList((prev) => [
                      ...prev,
                      {
                        file,
                        url: objectUrl,
                      },
                    ]);
                    e.target.value = "";

                    // Quietly run OCR in the background without blocking or alerting
                    try {
                      const apiKey = getGeminiApiKey();
                      if (apiKey) {
                        const compressedBlob = await compressImage(file);
                        const detectedNumber = await scanContainerWithGemini(compressedBlob, apiKey);
                        
                        if (detectedNumber && !detectedNumber.startsWith("DEBUG_RAW")) {
                          setContainer(detectedNumber);
                          if (typeof handleContainerChange === 'function') {
                            handleContainerChange({ target: { value: detectedNumber } });
                          } else if (typeof cariContainer === 'function') {
                            cariContainer(detectedNumber);
                          }
                        }
                      }
                    } catch (err) {
                      console.warn("Silent OCR failure:", err.message);
                    }
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
                  {
                    val: "Bottom/Bawah",
                    label: "Bottom (Bawah)",
                    x: 18,
                    y: 75,
                  },
                  {
                    val: "Inside/Dalam",
                    label: "Inside (Dalam)",
                    x: 50,
                    y: 58,
                  },
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
                      onClick={() => {
                        if (!isDisabled && !isUploading) {
                          if (selectedSides.includes(hotspot.val)) {
                            setSelectedSides(
                              selectedSides.filter((s) => s !== hotspot.val),
                            );
                          } else {
                            setSelectedSides([...selectedSides, hotspot.val]);
                          }
                        }
                      }}
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
            <div className="form-grid">
              {/* KONDISI */}
              <div className="form-group">
                <MultiSelectDropdown
                  options={[
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
                  ]}
                  value={selectedConditions}
                  placeholder="Ceklis Kondisi Kontainer"
                  disabled={isUploading}
                  onChange={(newVal, toggledVal) => {
                    if (toggledVal === "GOOD" || toggledVal === "Good") {
                      if (newVal.includes(toggledVal)) {
                        setSelectedConditions(["GOOD"]);
                        setSelectedSides([]);
                      } else {
                        setSelectedConditions(newVal);
                      }
                    } else {
                      // If selecting something else, remove "GOOD"
                      setSelectedConditions(
                        newVal.filter((v) => v !== "GOOD" && v !== "Good"),
                      );
                    }
                  }}
                />
              </div>

              {/* SISI */}
              <div className="form-group">
                <MultiSelectDropdown
                  options={[
                    { val: "Front/Depan", label: "Front/Depan" },
                    { val: "Rear/Belakang", label: "Rear/Belakang" },
                    {
                      val: "Left Side/Sisi Kiri",
                      label: "Left Side/Sisi Kiri",
                    },
                    {
                      val: "Right Side/Sisi Kanan",
                      label: "Right Side/Sisi Kanan",
                    },
                    { val: "Roof/Atas", label: "Roof/Atas" },
                    { val: "Bottom/Bawah", label: "Bottom/Bawah" },
                    { val: "Inside/Dalam", label: "Inside/Dalam" },
                  ]}
                  value={selectedSides}
                  placeholder="Ceklis Sisi Kerusakan"
                  disabled={
                    isUploading ||
                    selectedConditions.includes("Good") ||
                    selectedConditions.includes("GOOD")
                  }
                  onChange={(newVal) => setSelectedSides(newVal)}
                />
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
                onClick={() => setPage("dashboard")}
                disabled={isUploading}
              >
                <ArrowLeft size={18} />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                className="btn-save-inspection"
                onClick={simpanData}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Menyimpan ke Server...</span>
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

  //====================================================
  // MANAGER PAGE
  // ======================================================

  if (page === "manager") {
    return (
      <div style={managerContainer}>
        <div style={sidebar}>
          <svg
            width="60"
            height="60"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "0 auto 24px auto", display: "block" }}
          >
            <path
              d="M32 6 L54 17 L32 28 L10 17 Z"
              fill="url(#topGrad3)"
              stroke="#004aad"
              strokeWidth="1"
            />
            <path d="M10 17 L32 28 L32 54 L10 43 Z" fill="url(#leftGrad3)" />
            <path d="M32 28 L54 17 L54 43 L32 54 Z" fill="url(#rightGrad3)" />
            <path
              d="M15 20.5 L15 45.5 M20 23 L20 48 M25 25.5 L25 50.5 M30 28 L30 53"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
            />
            <path
              d="M37 52.5 M42 50 L42 25 M47 47.5 L47 22.5 M52 45 L52 20"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            <path
              d="M10 17 L32 28 L54 17 M32 28 L32 54"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d="M10 17 L10 43 L32 54 L54 43 L54 17 M32 6 L54 17 L32 28 L10 17 Z"
              stroke="#00357a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="topGrad3"
                x1="10"
                y1="17"
                x2="54"
                y2="17"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#004aad" />
              </linearGradient>
              <linearGradient
                id="leftGrad3"
                x1="10"
                y1="17"
                x2="32"
                y2="54"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#0b2c63" />
                <stop offset="100%" stopColor="#00183b" />
              </linearGradient>
              <linearGradient
                id="rightGrad3"
                x1="32"
                y1="28"
                x2="54"
                y2="43"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ff9f43" />
                <stop offset="100%" stopColor="#ff7a00" />
              </linearGradient>
            </defs>
          </svg>

          <button style={sidebarBtn} onClick={() => setPage("dashboard")}>
            Dashboard
          </button>

          <button style={sidebarBtn} onClick={() => setPage("inspection")}>
            Inspection
          </button>

          <button style={sidebarBtn} onClick={() => setPage("history")}>
            Riwayat
          </button>

          <button style={sidebarLogout} onClick={() => setPage("login")}>
            Logout
          </button>
        </div>

        <div style={managerContent}>
          <h1 style={managerTitle}>
            {role === "ADMIN" ? "ADMIN CONTROL PANEL" : `${role} CONTROL ROOM`}
          </h1>

          <div style={cardGrid}>
            <div
              style={{
                ...dashboardCard,
                background: "#2F80ED",
              }}
            >
              <h2>Total Inspeksi</h2>
              <h1>{history.length}</h1>
            </div>

            <div
              style={{
                ...dashboardCard,
                background: "#F2994A",
              }}
            >
              <h2>Damage</h2>
              <h1>
                {history.filter((item) => item.condition !== "GOOD").length}
              </h1>
            </div>

            <div
              style={{
                ...dashboardCard,
                background: "#27AE60",
              }}
            >
              <h2>Good</h2>
              <h1>
                {history.filter((item) => item.condition === "GOOD").length}
              </h1>
            </div>
          </div>

          <div style={chartBox}>
            <h2>Inspeksi Per Hari</h2>

            <div
              style={{
                width: "100%",
                height: "300px",
              }}
            >
              <ResponsiveContainer>
                <LineChart data={grafikData}>
                  <XAxis dataKey="tanggal" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2F80ED"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={tableBox}>
            <h2>Supervisor & Petugas</h2>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Role</th>
                  <th>Group</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>
                      {user.role === "PETUGAS" ? "PETUGAS LAPANGAN" : user.role}
                    </td>
                    <td>{user.group}</td>
                    <td>{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // OFFICE DASHBOARD PAGE
  // ======================================================

  if (page === "office-dashboard") {
    return (
      <ErrorBoundary>
        <OfficeDashboard
          user={user}
          manifestData={manifestData}
          setManifestData={setManifestData}
          importExcel={importExcel}
          onLogout={() => setPage("login")}
          onNavigate={(p) => setPage(p)}
        />
      </ErrorBoundary>
    );
  }

  // ======================================================
  // HISTORY PAGE
  // ======================================================

  if (page === "history") {
    return (
      <div style={bg}>
        <div style={card}>
          <h1 style={title}>RIWAYAT INSPEKSI</h1>

          {history.map((item, index) => (
            <div key={index} style={historyBox}>
              <h2>{item.container}</h2>

              <p>{item.shipName}</p>

              <p>{item.condition}</p>

              
<div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button style={{...button, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flex: 1}} onClick={() => cetakPdf(item)}>
    <FileText size={16} /> DOC
  </button>
  <button style={{...button, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flex: 1}} onClick={() => cetakFoto(item)}>
    <Image size={16} /> FOTO
  </button>
</div>

            </div>
          ))}

          <button style={logoutButton} onClick={() => setPage("dashboard")}>
            KEMBALI
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ======================================================
// STYLE
// ======================================================

const bg = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom,#0057b8,#ff9900)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const card = {
  background: "#fff",
  width: "100%",
  maxWidth: "650px",
  padding: "30px",
  borderRadius: "30px",
};

const logo = {
  width: "220px",
  display: "block",
  margin: "auto",
};

const title = {
  textAlign: "center",
  color: "#0B2B5C",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginBottom: "25px",
  marginTop: "15px",
};

const roleText = {
  textAlign: "center",
};

const input = {
  width: "100%",
  padding: "18px",
  marginBottom: "20px",
  borderRadius: "18px",
  border: "1px solid #ccc",
};

const textarea = {
  width: "100%",
  height: "140px",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid #ccc",
  marginBottom: "20px",
};

const button = {
  width: "100%",
  padding: "18px",
  background: "#ff7a00",
  color: "#fff",
  border: "none",
  borderRadius: "18px",
  marginBottom: "20px",
};

const logoutButton = {
  ...button,
  background: "red",
};

const historyBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "20px",
};

const managerContainer = {
  display: "flex",
  minHeight: "100vh",
  background: "#f5f6fa",
};

const sidebar = {
  width: "250px",
  background: "#062B5B",
  padding: "20px",
};

const sidebarLogo = {
  width: "180px",
  marginBottom: "30px",
};

const sidebarBtn = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  background: "#0B4DA2",
  color: "white",
  border: "none",
  borderRadius: "12px",
};

const sidebarLogout = {
  ...sidebarBtn,
  background: "red",
};

const managerContent = {
  flex: 1,
  padding: "30px",
};

const managerTitle = {
  fontSize: "38px",
  fontWeight: "bold",
  marginBottom: "30px",
  color: "#004aad",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const dashboardCard = {
  padding: "25px",
  borderRadius: "20px",
  color: "white",
};

const chartBox = {
  background: "white",
  padding: "20px",
  borderRadius: "20px",
  marginBottom: "30px",
};

const tableBox = {
  background: "white",
  padding: "20px",
  borderRadius: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};
