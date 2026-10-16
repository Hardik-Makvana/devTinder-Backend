const socket = require("socket.io");

const intializeSocket = (server)=>{

    const io = socket(server , {
        cors : {
            origin : "http://localhost:5173",
        },
    });

    io.on("connection" , (socket) => {
        //handle event
    })
}

module.exports =  intializeSocket ; 