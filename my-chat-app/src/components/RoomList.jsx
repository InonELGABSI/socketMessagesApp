
function RoomList({ rooms, currentRoom, onJoinRoom }) {
  if (rooms.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-2">No rooms available</p>
  }

  return (
    <ul className="space-y-1">
      {rooms.map((room) => (
        <li key={room.id}>
          <button
            onClick={() => onJoinRoom(room.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentRoom === room.id ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {room.name}
            <span className="text-xs text-gray-500 ml-2">({room.userCount || 0})</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default RoomList
