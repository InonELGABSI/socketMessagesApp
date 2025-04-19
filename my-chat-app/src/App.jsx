
import { useState } from "react"
import Login from "./components/Login"
import Chat from "./components/Chat"
import { useSocket } from "./hooks/useSocket"
import InvitationAlert from "./components/InvitationAlert"
import "./index.css"

function App() {
  const [user, setUser] = useState(null)
  const {
    isConnected,
    users,
    messages,
    rooms,
    currentRoom,
    invitations,
    directMessages,
    unreadCounts,
    sendMessage,
    sendDirectMessage,
    sendAlertToRoom,
    login,
    createRoom,
    joinRoom,
    inviteToRoom,
    respondToInvitation,
    markAsRead,
    socket,
  } = useSocket("http://localhost:3001")

  const handleLogin = (username) => {
    login(username)
    setUser({ username })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {invitations.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          {invitations.map((invitation) => (
            <InvitationAlert key={invitation.id} invitation={invitation} onRespond={respondToInvitation} />
          ))}
        </div>
      )}
      <Chat
        user={user}
        userId={socket.id}
        isConnected={isConnected}
        users={users}
        messages={messages}
        rooms={rooms}
        currentRoom={currentRoom}
        directMessages={directMessages}
        unreadCounts={unreadCounts}
        sendMessage={sendMessage}
        sendDirectMessage={sendDirectMessage}
        createRoom={createRoom}
        joinRoom={joinRoom}
        inviteToRoom={inviteToRoom}
        markAsRead={markAsRead}
        sendAlertToRoom={sendAlertToRoom}
      />
    </div>
  )
}

export default App
