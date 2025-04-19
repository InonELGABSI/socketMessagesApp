
function InvitationAlert({ invitation, onRespond }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-md animate-fade-in">
      <h3 className="font-semibold text-gray-800">Room Invitation</h3>
      <p className="text-gray-600 my-2">
        <span className="font-medium">{invitation.sender.username}</span> has invited you to join
        <span className="font-medium"> {invitation.roomName}</span>
      </p>
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={() => onRespond(invitation.id, false)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => onRespond(invitation.id, true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

export default InvitationAlert
