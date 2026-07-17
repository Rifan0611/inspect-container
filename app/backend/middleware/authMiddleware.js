const jwt = require('jsonwebtoken')
const { logSecurityEvent } = require("../utils/securityLogger");

module.exports = (req,res,next)=>{
    const authHeader = req.headers.authorization

    if(!authHeader){
        logSecurityEvent("BLOCKED_API", `Akses diblokir: Request tanpa token ke "${req.originalUrl || req.url}"`, req.ip);
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
        logSecurityEvent("BLOCKED_API", `Akses diblokir: Token tidak valid untuk "${req.originalUrl || req.url}"`, req.ip);
        res.status(401).json({
            message: 'Invalid Token'
        })
    }
}