const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const dashboardRoutes = require("./routes/dashboardRoutes");
const manifestRoutes = require("./routes/manifestRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/dashboard", dashboardRoutes);
app.use("/api", manifestRoutes);
app.use("/api/inspection", inspectionRoutes);
app.use("/api", accountsRoutes);
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

    const fileName =
      `${data.containerNumber}.pdf`;

    const filePath =
      `./pdf/${fileName}`;

    const doc =
      new PDFDocument();

    doc.pipe(
      fs.createWriteStream(filePath)
    );

    doc.fontSize(20)
      .text("BERITA ACARA CONTAINER INSPECTION");

    doc.moveDown();

    doc.fontSize(14)
      .text(`Nomor Container : ${data.containerNumber}`);

    doc.text(`Nama Kapal : ${data.shipName}`);
    doc.text(`Tanggal : ${data.date}`);
    doc.text(`Kerusakan : ${data.damage1}`);
    doc.text(`Sisi : ${data.side1}`);
    doc.text(`Catatan : ${data.note}`);

    doc.end();

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `SERVER RUNNING ${PORT}`
      );
    }
  );
}

module.exports = app;