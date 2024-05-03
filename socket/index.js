const {Server} = require("socket.io")
let messageId = 0
let messages = new Map()
let users = new Map()
let sockets = new Map()
// let waitingFunc = require("../snippet")
// waitingFunc()
function connectSocket(server){
  let io = new Server(server, {
      port: 5011,
      cors: {
        origin: "http://localhost:3000"
      }
    })
    
    io.on("connection", (socket) => {
      //register user and update
      // if(!sockets.has(socket.id)){
      //   sockets.set(socket.id,socket)
      // }
      // socket.on('create', function (room) {
      //   socket.join(room);
      // });

      socket.on("registerUser", (user) => {
        // console.log("register user")
            const tempUser = users.get(user._id)
            sockets.delete(tempUser?.socketId)
            sockets.set(socket.id,{socket,user})
            users.set(user._id,{...user,socketId:socket.id})
            io.emit("updateUsers", { users:[...users.values()], user: {...user} })
      })
    
      //get message and update
      socket.on("message", (message) => {
        message.id = ++messageId
        messages.set(message,{...message,time_stamp:new Date()})
        // socket.emit("receiveMessage", message)
        io.emit("receiveMessage",{...message,time_stamp:new Date()});
      })
    
      socket.on("disconnect", () => {
        // users.forEach((username, index) => {
        //   if (username.socketId == socket.id) {
        //     users.splice(index, 1);
        //     console.log("disconnected:" + username.username);
        //   }
        // })
        if(sockets.has(socket.id)){
          const tempSocket = sockets.get(socket.id)
          users.delete(tempSocket?.user?._id)
          sockets.delete(socket.id)
          socket.broadcast.emit("userDisconnected",{users:[...users.values()]})
        }
      })
    })
}
function establishConnection(user){
  io.on("connection", (socket) => {
    console.log("new User Connected")
    socket.emit("newMessage", { user })
  
    socket.on("createMessage", (newMessage) => {
      console.log('newMessage from client', newMessage)
    })
  
    socket.on("disconnect", () => {
      console.log("disconnected from user")
    })
  })
}
module.exports = {
    // io,
    connectSocket,
    // establishConnection
}
