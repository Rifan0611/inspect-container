const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const dashboardRoutes = require("./routes/dashboardRoutes");
const manifestRoutes = require("./routes/manifestRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Disable X-Powered-By header to prevent framework fingerprinting
app.disable("x-powered-by");

// Security Headers & Rate Limiting
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Global Rate Limiter for API endpoints (DDoS / Flooding protection)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // Maksimal 300 request per 15 menit per IP
  message: { error: "Terlalu banyak permintaan API. Silakan coba lagi beberapa saat lagi." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login Rate Limiter (Brute force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit per IP
  message: { error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict CORS Policy
const allowedOrigins = [
  "https://containerinspection.my.id",
  "http://containerinspection.my.id",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".my.id")) {
      return callback(null, true);
    }
    return callback(new Error("CORS Policy: Origin tidak diizinkan oleh sistem keamanan"));
  },
  credentials: true
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/", globalApiLimiter);
app.use("/api/accounts/login", loginLimiter);
app.use("/api", accountsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inspection", inspectionRoutes);
app.use("/api", manifestRoutes);
app.use("/api/upload", uploadRoutes);
const uploadsDir = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("SERVER BACKEND BERJALAN");
});

app.post("/generate-pdf", (req, res) => {
  try {
    const data = req.body;

    const fileName = `${data.containerNumber}.pdf`;

    const filePath = `./pdf/${fileName}`;

    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("BERITA ACARA CONTAINER INSPECTION");

    doc.moveDown();

    doc.fontSize(14).text(`Nomor Container : ${data.containerNumber}`);

    doc.text(`Tanggal : ${data.date}`);
    doc.text(`Kerusakan : ${data.damage1}`);
    doc.text(`Sisi : ${data.side1}`);
    doc.text(`Catatan : ${data.note}`);

    doc.end();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SERVER RUNNING ${PORT}`);
  });
}

module.exports = app;
