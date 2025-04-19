import { useEffect, useRef } from "react";

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1];

    // Start a new group דאטךק if:
    // 1. This is the first message
    // 2. The sender changed
    // 3. More than 5 minutes passed since the last message
    const shouldStartNewGroup =
      !prevMessage ||
      prevMessage.sender?.id !== message.sender?.id ||
      new Date(message.timestamp) - new Date(prevMessage.timestamp) > 5 * 60 * 1000;

    if (shouldStartNewGroup) {
      groups.push([message]);
    } else {
      groups[groups.length - 1].push(message);
    }

    return groups;
  }, []);

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => {
        const isCurrentUser = group[0].sender?.id === currentUserId;

        return (
          <div key={groupIndex} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-xs">
                    {group[0].sender?.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>
            )}

            <div className={`max-w-xs md:max-w-md space-y-1`}>
              {!isCurrentUser && (
                <div className="font-medium text-xs text-gray-800 ml-1">{group[0].sender?.username || "Unknown"}</div>
              )}

              {group.map((message, messageIndex) => (
                <div
                  key={messageIndex}
                  className={`rounded-lg px-4 py-2 ${
                    isCurrentUser ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow"
                  } ${
                    messageIndex === 0
                      ? isCurrentUser
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                      : messageIndex === group.length - 1
                        ? isCurrentUser
                          ? "rounded-tr-none"
                          : "rounded-tl-none"
                        : isCurrentUser
                          ? "rounded-r-none"
                          : "rounded-l-none"
                  }`}
                >
                  <p>{message.content}</p>
                  {messageIndex === group.length - 1 && (
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
