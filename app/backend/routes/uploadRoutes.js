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

const upload =
multer({

  storage:storage
})

/*
|--------------------------------------------------------------------------
| UPLOAD IMAGE
|--------------------------------------------------------------------------
*/

router.post(

  '/image',

  upload.single('photo'),

  async(req,res)=>{

    try{

      if(!req.file){

        return res.status(400)
        .json({

          message:
          'No File Uploaded'
        })
      }

      res.json({

        message:
        'Upload Success',

        filename:
        req.file.filename,

        file:
        req.file.filename
      })

    }catch(error){

      console.log(error)

      res.status(500).json({

        message:
        'Upload Failed',

        error:
        error.message
      })
    }
  }
)

module.exports =
router