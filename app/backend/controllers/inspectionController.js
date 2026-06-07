const db = require('../config/db')

exports.createInspection = (req,res)=>{

    const {

        container_number,
        condition_status,
        container_side,
        notes,
        latitude,
        longitude,
        photo

    } = req.body

    const sql =

    `
    INSERT INTO inspections(

        container_number,
        condition_status,
        container_side,
        notes,
        latitude,
        longitude,
        photo

    )

    VALUES(?,?,?,?,?,?,?)
    `

    db.query(

        sql,

        [

            container_number,
            condition_status,
            container_side,
            notes,
            latitude,
            longitude,
            photo
        ],

        (err,result)=>{

            if(err){

                return res.status(500)
                .json(err)
            }

            res.json({

                message:
                'Inspection Saved'
            })
        }
    )
}

exports.getInspections = (req,res)=>{

    const sql =
    `
    SELECT * FROM inspections
    ORDER BY id DESC
    `

    db.query(sql,(err,result)=>{

        if(err){

            return res.status(500)
            .json(err)
        }

        res.json(result)
    })
}