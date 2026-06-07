exports.uploadImage = (req,res)=>{

    if(!req.file){
        return res.status(400).json({
            message:'No file uploaded'
        })
    }

    res.json({
        message:'Upload Success',
        file:req.file.filename,
        path:`/uploads/${req.file.filename}`
    })
}