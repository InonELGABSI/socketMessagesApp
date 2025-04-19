import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

// In-memory stores (for demo only)
let users = []               // { id, name, avatar }
let rooms = []               // { id, name, participants: [userId], messages: [] }
let invitations = []         // { id, roomId, from, to }

// Utility: broadcast user & room lists
function emitUsers() {
  io.emit('users', users)
}
function emitRooms() {
  io.emit('rooms', rooms)
}

io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`)

  socket.emit('users', users)
  socket.emit('rooms', rooms)

  socket.on('login', ({ username, avatar }) => {
    const existing = users.find(u => u.id === socket.id)
    if (!existing) {
      users.push({ id: socket.id, username: username, avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` })
      emitUsers()
    }
  })

  socket.on('createRoom', ({ name }) => {
    const roomId = uuidv4()
    const room = { id: roomId, name, participants: [socket.id], messages: [] }
    rooms.push(room)
    socket.join(roomId)
    emitRooms()
  })

  socket.on('joinRoom', ({ roomId }) => {
    const room = rooms.find(r => r.id === roomId)
    if (room && !room.participants.includes(socket.id)) {
      room.participants.push(socket.id)
      socket.join(roomId)
      // Send chat history to this client
      socket.emit('messages', room.messages)
      emitRooms()
    }
  })

  socket.on('message', ({ content, roomId }) => {
    const room = rooms.find(r => r.id === roomId)
    const sender = users.find(u => u.id === socket.id)
    if (room && sender) {
      const msg = {
        id: uuidv4(),
        content,
        sender: { id: sender.id, username: sender.username, avatar: sender.avatar },
        roomId,
        timestamp: Date.now()
      }
      room.messages.push(msg)
      io.in(roomId).emit('message', msg)
    }
  })

  socket.on('directMessage', ({ content, recipientId }) => {
    const sender = users.find(u => u.id === socket.id)
    if (!sender) return
    const msg = {
      id: uuidv4(),
      content,
      sender: { id: sender.id, username: sender.username, avatar: sender.avatar },
      recipientId,
      timestamp: Date.now(),
      isDirect: true
    }
    // Send to recipient and back to sender
    io.to(recipientId).emit('directMessage', msg)
    socket.emit('directMessage', msg)
  })


socket.on('invite', ({ userId, roomId }) => {
  const inviteId = uuidv4()
  const room    = rooms.find(r => r.id === roomId);
  const sender  = users.find(u => u.id === socket.id);
  if (!room || !sender) return;

  invitations.push({ id: inviteId, roomId, from: socket.id })

  // emit to the invitee, including sender info and roomName
  socket.to(userId).emit('invitation', {
    id: inviteId,
    roomId,
    sender: {
      id:       sender.id,
      username: sender.username,
      avatar:   sender.avatar
    },
    roomName: room.name
  })
})



  socket.on('invitationResponse', ({ invitationId, accept }) => {
    const invIndex = invitations.findIndex(i => i.id === invitationId)
    if (invIndex !== -1) {
      const { roomId, to } = invitations[invIndex]
      invitations.splice(invIndex, 1)

      if (accept) {
        const room = rooms.find(r => r.id === roomId)
        if (room && !room.participants.includes(socket.id)) {
          room.participants.push(socket.id)
          socket.join(roomId)
          socket.emit('messages', room.messages)
          emitRooms()
        }
      }
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    users = users.filter(u => u.id !== socket.id)
    // Remove from rooms
    rooms.forEach(r => { r.participants = r.participants.filter(id => id !== socket.id) })
    emitUsers()
    emitRooms()
  })
})

// Simple health-check endpoint
app.get('/', (req, res) => res.send('Socket server is running'))

server.listen(3001, () => {
  console.log('⚡️ Socket.io server listening on port 3001')
})
