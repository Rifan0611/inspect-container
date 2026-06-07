const db = require('../config/db')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

exports.register = async(req,res)=>{

    try{

        const {
            name,
            email,
            password,
            role
        } = req.body

        const hashedPassword =
        await bcrypt.hash(password,10)

        const sql =
        `
        INSERT INTO users(
            name,
            email,
            password,
            role
        )
        VALUES(?,?,?,?)
        `

        db.query(
            sql,
            [
                name,
                email,
                hashedPassword,
                role
            ],
            (err,result)=>{

                if(err){

                    return res.status(500)
                    .json(err)
                }

                res.json({

                    message:
                    'Register Success'
                })
            }
        )

    }catch(error){

        res.status(500).json(error)
    }
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

exports.login = (req,res)=>{

    const {
        email,
        password
    } = req.body

    const sql =
    `
    SELECT * FROM users
    WHERE email=?
    `

    db.query(
        sql,
        [email],
        async(err,result)=>{

            if(err){

                return res.status(500)
                .json(err)
            }

            if(result.length === 0){

                return res.status(401)
                .json({

                    message:
                    'Email Not Found'
                })
            }

            const user = result[0]

            const validPassword =
            await bcrypt.compare(
                password,
                user.password
            )

            if(!validPassword){

                return res.status(401)
                .json({

                    message:
                    'Wrong Password'
                })
            }

            const token =
            jwt.sign(

                {
                    id:user.id,
                    email:user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:'7d'
                }
            )

            res.json({

                message:
                'Login Success',

                token,

                user
            })
        }
    )
}