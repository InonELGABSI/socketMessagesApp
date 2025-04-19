import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

export function useSocket(url) {
  const [isConnected, setIsConnected]   = useState(false)
  const [users, setUsers]               = useState([])
  const [messages, setMessages]         = useState([])
  const [rooms, setRooms]               = useState([])
  const [currentRoom, setCurrentRoom]   = useState(null)
  const [invitations, setInvitations]   = useState([])
  const [directMessages, setDirectMessages] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const socketRef = useRef(null)
  const currentRoomRef = useRef(currentRoom)

  useEffect(() => {
    currentRoomRef.current = currentRoom
  }, [currentRoom])

  useEffect(() => {
    const socket = io(url)
    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
    })
    socket.on("disconnect", () => setIsConnected(false))

    socket.on("users",       setUsers)
    socket.on("rooms",       setRooms)
    socket.on("messages",    setMessages)
    socket.on("invitation",  inv => setInvitations(prev => [...prev, inv]))

    socket.on("message", message => {
      if (message.roomId === currentRoomRef.current) {
        setMessages(prev => [...prev, message])
      } else if (message.isDirect) {
        const sid = message.sender.id
        setDirectMessages(prev => ({
          ...prev,
          [sid]: [...(prev[sid]||[]), message]
        }))
        if (sid !== socket.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [sid]: (prev[sid]||0) + 1
          }))
        }
      }
    })

    socket.on("directMessage", message => {
      const sid = message.sender.id
      setDirectMessages(prev => ({
        ...prev,
        [sid]: [...(prev[sid]||[]), message]
      }))
      if (sid !== socket.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [sid]: (prev[sid]||0) + 1
        }))
      }
    })

    return () => { socket.disconnect() }
  }, [url]) 

  // ─── API FUNCTIONS ───────────────────────────────────────────────────────────

  function login(username) {
    if (socketRef.current && username.trim()) {
      socketRef.current.emit("login", { username });
      socketRef.current.on("loggedIn", ({ id }) => {
        setUserId(id);
      });
    }
  }

  function createRoom(roomName) {
    if (!socketRef.current || !roomName.trim()) return
    socketRef.current.emit("createRoom", { name: roomName })
  }

  function joinRoom(roomId) {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit("joinRoom", { roomId })
    setCurrentRoom(roomId)
  }

  function sendMessage(content, roomId) {
    if (!socketRef.current || !content.trim()) return
    const targetRoom = roomId || currentRoom
    socketRef.current.emit("message", { content, roomId: targetRoom })
  }

  function sendDirectMessage(content, recipientId) {
    if (!socketRef.current || !content.trim() || !recipientId) return
    socketRef.current.emit("directMessage", { content, recipientId })
  }

  function inviteToRoom(userId, roomId) {
    if (!socketRef.current || !userId) return
    const targetRoom = roomId || currentRoom
    socketRef.current.emit("invite", { userId, roomId: targetRoom })
  }

  function respondToInvitation(invitationId, accept) {
    if (!socketRef.current || !invitationId) return
    socketRef.current.emit("invitationResponse", { invitationId, accept })
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId))

    if (accept) {
      const inv = invitations.find(i => i.id === invitationId)
      if (inv) joinRoom(inv.roomId)
    }
  }

  function markAsRead(userId) {
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }))
  }

  return {
    isConnected,
    users,
    messages,
    rooms,
    currentRoom,
    invitations,
    directMessages,
    unreadCounts,

    login,
    createRoom,
    joinRoom,
    sendMessage,
    sendDirectMessage,
    inviteToRoom,
    respondToInvitation,
    markAsRead,

    socket: socketRef.current,
  }
}
