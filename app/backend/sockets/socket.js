module.exports = (io)=>{

    io.on('connection',(socket)=>{

        console.log(
            'Realtime Connected'
        )

    })
}