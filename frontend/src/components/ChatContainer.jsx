import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { ChevronLeft, UserRound, MoreVertical } from "lucide-react";
import MessageSkeleton from "../skeleton/MessageSkeleton.jsx";
import MessageInput from "../skeleton/MessageInput.jsx";
import { useAuthStore } from "../store/useAuthStore.js";

const ChatContainer = () => {
  const {
    selectedUser,
    getMessage,
    isMessagesLoading,
    messages,
    sendMessages,
    setSelectedUser,
    deleteChat,
    subscribeToMessages,
    unSubscribeFromMessages,
    socketInitialized,
  } = useChatStore();
  const { authUser, socket, onlineUsers } = useAuthStore();
  const chatRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isUserOnline = onlineUsers.includes(selectedUser?._id);

  useEffect(() => {
    if (selectedUser && selectedUser._id === authUser._id) {
      setSelectedUser(null);
    }
  }, [authUser._id, selectedUser]);

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessage(selectedUser._id);
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (socket && selectedUser && !socketInitialized) {
      subscribeToMessages();
    }

    return () => {
      if (socketInitialized) {
        unSubscribeFromMessages();
      }
    };
  }, [socket, selectedUser, socketInitialized]);

  useEffect(() => {
    if (chatRef.current && messages.length > 0) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async ({ text, image }) => {
    if ((!text || text.trim() === "") && !image) return;
    await sendMessages({ text: text?.trim(), image });
  };

  const handleEndChat = () => {
    setSelectedUser(null);
  };

  const handleDeleteChat = async () => {
    if (selectedUser && selectedUser._id) {
      await deleteChat(selectedUser._id);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100">
        <div className="text-center text-gray-500">
          <UserRound className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            No conversation selected
          </h3>
          <p>Choose a contact to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-base-100 relative">
      <div className="px-4 py-1 bg-base-200 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setSelectedUser(null)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedUser.profilePic ? (
              <img
                src={selectedUser.profilePic}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">{selectedUser.fullName}</h3>
            <p className="text-xs text-gray-500">
              {isUserOnline ? (
                <span className="text-green-500 font-medium">Online</span>
              ) : (
                <span className="text-red-500 font-medium">Offline</span>
              )}
            </p>
          </div>
        </div>

        <div className="relative dropdown-menu">
          <MoreVertical
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          {isDropdownOpen && (
            <div className="absolute top-10 right-0 bg-white border border-gray-300 shadow-lg rounded-lg z-50 w-40 text-black">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-lg"
                onClick={handleEndChat}
              >
                End Chat
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-lg"
                onClick={handleDeleteChat}
              >
                Delete Chat
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-lg"
                onClick={() => alert("View Profile Clicked")}
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {isMessagesLoading ? (
        <MessageSkeleton />
      ) : (
        <div ref={chatRef} className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-center">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSentByAuthUser = msg.senderId === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`chat my-5 ${
                    isSentByAuthUser ? "chat-end" : "chat-start"
                  }`}
                >
                  {/* User Profile Image */}
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full overflow-hidden">
                      {isSentByAuthUser ? (
                        authUser.profilePic ? (
                          <img
                            src={authUser.profilePic}
                            alt="profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                        )
                      ) : selectedUser.profilePic ? (
                        <img
                          src={selectedUser.profilePic}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                  </div>

                  {/* Chat Bubble */}
                  <div>
                    <div
                      className={`${
                        !isSentByAuthUser ? "chat-footer" : "chat-header"
                      } flex items-center gap-2`}
                    >
                      <span className="font-medium text-sm">
                        {isSentByAuthUser ? "You" : selectedUser.fullName}
                      </span>
                      <time className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <div className="chat-bubble break-words max-w-xs md:max-w-md lg:max-w-lg">
                    {msg.text && <p>{msg.text}</p>}
                      {msg.image && (
                        <div className="mt-2">
                          <img
                            src={msg.image}
                            alt="Message attachment"
                            className="max-w-full rounded-lg max-h-60 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    {/* Message Footer */}
                    <div className="chat-footer text-xs opacity-70 text-gray-500 mt-1">
                      {isSentByAuthUser
                        ? msg.seen
                          ? `Seen at ${new Date(msg.seenAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "Delivered"
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
