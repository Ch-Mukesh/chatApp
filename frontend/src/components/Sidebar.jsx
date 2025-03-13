import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Users, Search, UserRound, X, UserCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const { onlineUsers } = useAuthStore();
  
  useEffect(() => {
    getUsers();
  }, [getUsers]);


    // Function to check if the user is online
    const isUserOnline = (userId) => {
      return onlineUsers.includes(userId);
    };
  
  // Filter users based on search query and online status
  const filteredUsers = users.filter(user => {
    // First apply search filter
    const matchesSearch = !searchQuery || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then apply online filter if needed
    if (showOnlineOnly) {
      return matchesSearch && isUserOnline(user._id);
    }
    
    return matchesSearch;
  });

  // Debug log to see the structure of onlineUsers
  useEffect(() => {
    console.log("Current online users:", onlineUsers);
  }, [onlineUsers]);


  return (
    <aside className="w-20 lg:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-200">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 w-full p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 hidden lg:block">
            Contacts
          </h2>
        </div>
        
        {/* Search and Filters */}
        <div className="hidden lg:block space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-none text-black dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            )}
          </div>
          
          {/* Online Users Only Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                showOnlineOnly 
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Online Only</span>
              <div className={`ml-2 w-4 h-4 rounded-full border ${
                showOnlineOnly 
                  ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-400 dark:border-indigo-400" 
                  : "bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-500"
              }`}>
                {showOnlineOnly && (
                  <div className="flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </div>
            </button>
            
            {/* Show count of online users */}
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {onlineUsers.length - 1} online
            </div>
          </div>
        </div>
        
        {/* Mobile view - Online filter icon only */}
        <div className="flex justify-center lg:hidden mt-3">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`p-2 rounded-full ${
              showOnlineOnly 
                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
            title={showOnlineOnly ? "Show all users" : "Show online users only"}
          >
            <UserCheck className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* User List */}
      <div className="overflow-y-auto flex-1 py-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg mx-2 my-1 
                ${selectedUser?._id === user._id 
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400" 
                  : ""}`}
            >
              <div className="relative flex-shrink-0">
                {/* Profile Picture */}
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/150/150";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                      <UserRound className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>

                {/* Online/Offline Indicator */}
                <div 
                  className="absolute bottom-0 right-0 h-3 w-3 border-2 border-white dark:border-gray-900 rounded-full"
                  style={{
                    backgroundColor: isUserOnline(user._id) ? '#22c55e' : '#9ca3af'
                  }}
                  title={isUserOnline(user._id) ? 'Online' : 'Offline'}
                />
              </div>
              
              {/* User info */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.fullName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isUserOnline(user._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 px-4">
            {searchQuery && showOnlineOnly 
              ? "No matching online contacts found" 
              : searchQuery 
                ? "No matching contacts found" 
                : showOnlineOnly 
                  ? "No online contacts available" 
                  : "No contacts available"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;