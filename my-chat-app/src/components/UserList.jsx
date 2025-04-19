
function UserList({ users, currentUserId, unreadCounts, onUserClick, onInviteUser, currentRoom }) {
  return (
    <div className="overflow-y-auto h-full">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => {
          const unreadCount = unreadCounts[user.id] || 0
          const isCurrentUser = user.id === currentUserId

          return (
            <li key={user.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => !isCurrentUser && onUserClick(user.id)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {user.username}
                        {isCurrentUser && " (You)"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isCurrentUser && currentRoom && (
                  <button
                    onClick={() => onInviteUser(user.id)}
                    className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded transition-colors"
                    title={`Invite ${user.username} to this room`}
                  >
                    Invite
                  </button>
                )}
              </div>
            </li>
          )
        })}
        {users.length === 0 && <li className="p-4 text-sm text-gray-500 text-center">No users connected</li>}
      </ul>
    </div>
  )
}

export default UserList
