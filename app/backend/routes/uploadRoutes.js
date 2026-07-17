const express =
require('express')

const router =
express.Router()

const multer =
require('multer')

const path =
require('path')

/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const storage =
multer.diskStorage({

  destination:
  function(req,file,cb){
    const fs = require('fs');
    const path = require('path');
    const dest = process.env.VERCEL
      ? "/tmp/uploads"
      : path.join(__dirname, '../uploads');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },

  filename:
  function(req,file,cb){

    cb(

      null,

      Date.now() +

      path.extname(
        file.originalname
      )
    )
  }
})

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const isExtensionAllowed = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isMimeAllowed = allowedExtensions.test(file.mimetype);

  if (isExtensionAllowed && isMimeAllowed) {
    return cb(null, true);
  }
  
  const { logSecurityEvent } = require("../utils/securityLogger");
  logSecurityEvent("BLOCKED_UPLOAD", `Upload diblokir: Percobaan mengunggah file berbahaya "${file.originalname}"`, req.ip);
  cb(new Error("Hanya file gambar (.jpg, .jpeg, .png, .webp, .gif) yang diperbolehkan!"));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

/*
|--------------------------------------------------------------------------
| UPLOAD IMAGE
|--------------------------------------------------------------------------
*/

router.post(
  '/image',
  (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: 'Upload Failed',
          error: err.message
        });
      }
      next();
    });
  },
  async(req,res)=>{
    try{
      if(!req.file){
        return res.status(400).json({
          message: 'No File Uploaded'
        })
      }

      res.json({
        message: 'Upload Success',
        filename: req.file.filename,
        file: req.file.filename
      })

    }catch(error){
      console.log(error)
      res.status(500).json({
        message: 'Upload Failed',
        error: error.message
      })
    }
  }
)

module.exports =
router