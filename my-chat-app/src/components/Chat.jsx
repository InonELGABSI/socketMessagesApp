
import { useState } from "react"
import UserList from "./UserList"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import RoomList from "./RoomList"
import RoomCreator from "./RoomCreator"
import DirectMessageModal from "./DirectMessageModal"

function Chat({
  user,
  userId,
  isConnected,
  users,
  messages,
  rooms,
  currentRoom,
  directMessages,
  unreadCounts,
  sendMessage,
  sendDirectMessage,
  createRoom,
  joinRoom,
  inviteToRoom,
  markAsRead,
}) {
  const [showRoomCreator, setShowRoomCreator] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDirectMessage, setShowDirectMessage] = useState(false)
// Function to get and sort direct messages
const getDirectConversation = (meId, otherId) => {
  const incoming = directMessages[otherId] || []; // Messages from the other user
  const outgoing = (directMessages[meId] || []).filter(m => m.recipientId === otherId); // Messages sent by current user to other user
  return [...incoming, ...outgoing]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort messages by timestamp
}

  const handleUserClick = (userId) => {
    const clickedUser = users.find((u) => u.id === userId)
    if (clickedUser) {
      setSelectedUser(clickedUser)
      setShowDirectMessage(true)
      markAsRead(userId)
    }
  }

  const handleCloseDirectMessage = () => {
    setShowDirectMessage(false)
    setSelectedUser(null)
  }

  const handleSendDirectMessage = (content) => {
    if (selectedUser) {
      sendDirectMessage(content, selectedUser.id)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar - Rooms and Users */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Connection status */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Chat App</h2>
          <div className="mt-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as <span className="font-medium">{user.username}</span>
          </p>
        </div>

        {/* Rooms section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Rooms</h3>
            <button
              onClick={() => setShowRoomCreator(true)}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            >
              New Room
            </button>
          </div>
          <RoomList rooms={rooms} currentRoom={currentRoom} onJoinRoom={joinRoom} />
        </div>

        {/* Users section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Connected Users</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              users={users}
              currentUserId={userId}
              unreadCounts={unreadCounts}
              onUserClick={handleUserClick}
              onInviteUser={inviteToRoom}
              currentRoom={currentRoom}
            />
          </div>
        </div>
      </div>

      {/* Right column - Chat messages */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentRoom ? `Room: ${rooms.find((r) => r.id === currentRoom)?.name || "Chat"}` : "General Chat"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} currentUserId={userId} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </div>

      {/* Room creator modal */}
      {showRoomCreator && <RoomCreator onCreateRoom={createRoom} onClose={() => setShowRoomCreator(false)} />}

      {/* Direct message modal */}
      {showDirectMessage && selectedUser && (
        <DirectMessageModal
          user={selectedUser}
          messages={getDirectConversation(userId, selectedUser.id)} // Use the function to fetch messages
          currentUserId={userId}
          onSendMessage={handleSendDirectMessage}
          onClose={handleCloseDirectMessage}
        />
      )}

    </div>
  )
}

export default Chat
