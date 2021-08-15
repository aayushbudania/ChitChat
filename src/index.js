const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {getMessages,getLocMessages} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const dirPath = path.join(__dirname,'../public')
app.use(express.static(dirPath))

// let count = 0

io.on('connection',(socket)=>{
      console.log('web socket server')
      
      socket.on('join',(options, callback)=>{//{username,room}
            const {error, user} = addUser({id:socket.id,...options})//username, room // spread operator

            if(error)
                  return callback(error)

            socket.join(user.room) // user.room - trimed and lower cased
            socket.emit('message',getMessages('Admin','Welcome!'))
            socket.broadcast.to(user.room).emit('message', getMessages('Admin',user.username+' joined')) // sends to all clients except that who joined(socket)      

            io.to(user.room).emit('roomMembers',{
                  room: user.room,
                  users: getUsersInRoom(user.room)
            })

            callback()
      })

      socket.on('sendmsg',(msg,callback)=>{

            const filter = new Filter()
            if(filter.isProfane(msg)){
                  return callback('Profanity is prohibited.')
            }

            const user = getUser(socket.id)
            io.to(user.room).emit('message',getMessages(user.username, msg)) // sends msg to all clients in a room
            callback()  // reciever will send callback(ack)

      })

      socket.on('sendLocation',(loc,callback)=>{

            const user = getUser(socket.id)

            io.to(user.room).emit('sendLocation', getLocMessages(user.username, "https://www.google.com/maps?q="+loc.latitute + ","+ loc.longitude) )
            callback()

      })

      socket.on('disconnect',()=>{ // runs when client disconnects
            const user = removeUser(socket.id)

            if(user){
                  io.to(user.room).emit('message',getMessages('Admin',user.username+' left:('))
                  io.to(user.room).emit('roomMembers',{
                        room:user.room,
                        users: getUsersInRoom(user.room)
                  })
            }

      })

      // socket.emit('countupdate',count)  // countupdate = server -> client , increament = client -> server

      // socket.on('increament',()=>{
      //       count++
      //       io.emit('countupdate',count) //io.emit - all connected user, socket.emit - specific user
      // })
})

server.listen(port,() =>{
      console.log('server is up on port '+port)
})