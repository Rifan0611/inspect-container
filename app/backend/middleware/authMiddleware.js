const jwt = require('jsonwebtoken')

module.exports = (req,res,next)=>{
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({
            message: 'Access Denied'
        })
    }

    try{
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : authHeader

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = verified
        next()
    }catch(error){
        res.status(401).json({
            message: 'Invalid Token'
        })
    }
}