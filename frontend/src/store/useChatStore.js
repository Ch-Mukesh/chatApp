import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  socketInitialized: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessage: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Complete socket reinitialization approach
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Force unsubscribe first to prevent duplicate listeners
    get().unSubscribeFromMessages();

    // Add debugging to verify event binding
    console.log("Subscribing to socket events for real-time messages");

    // Listen to incoming messages for receiver
    socket.on("newMsg", (newMessage) => {
      console.log("Received newMsg event:", newMessage);
      const currentSelectedUser = get().selectedUser;

      if (
        currentSelectedUser &&
        (newMessage.senderId === currentSelectedUser._id ||
          newMessage.receiverId === currentSelectedUser._id)
      ) {
        const { messages } = get();

        // Prevent duplicate messages
        const messageExists = messages.some(
          (msg) => msg._id === newMessage._id
        );
        if (!messageExists) {
          console.log("Adding new received message to state");
          set({ messages: [...messages, newMessage] });
        }
      }
    });

    // Listen to message sent event for sender
    socket.on("newMsgSent", (newMessage) => {
      console.log("Received newMsgSent event:", newMessage);
      const { messages } = get();
      const currentSelectedUser = get().selectedUser;

      // Only update if relevant to current chat
      if (
        currentSelectedUser &&
        (newMessage.senderId === currentSelectedUser._id ||
          newMessage.receiverId === currentSelectedUser._id)
      ) {
        // Prevent duplicate messages
        const messageExists = messages.some(
          (msg) => msg._id === newMessage._id
        );
        if (!messageExists) {
          console.log("Adding new sent message to state");
          set({ messages: [...messages, newMessage] });
        }
      }
    });

    set({ socketInitialized: true });
  },

  // Improved unsubscribe
  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Unsubscribing from socket events");
      socket.off("newMsg");
      socket.off("newMsgSent");
      set({ socketInitialized: false });
    }
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    // Ensure there's content to send
    if (!messageData.text && !messageData.image) {
      return;
    }

    try {
      // Optimistic update with temporary ID
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        text: messageData.text || "",
        image: messageData.image || null,
        senderId: useAuthStore.getState().authUser._id,
        receiverId: selectedUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSeen: false,
      };

      // Add to UI immediately
      set({ messages: [...messages, tempMessage] });

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace temp message with actual message
      const updatedMessages = messages
        .filter((msg) => msg._id !== tempMessage._id)
        .concat(res.data);

      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  setSelectedUser: (selectedUser) => {
    // Clear messages when user is deselected
    if (!selectedUser) {
      set({ messages: [], selectedUser: null });
    } else {
      set({ selectedUser });
    }
  },

  deleteChat: async (userId) => {
    if (!userId) {
      console.log("Cannot delete chat: No userId provided");
      return;
    }
  
    console.log("🚀 Attempting to delete chat for user:", userId);
  
    try {
      // Ensure userId is properly passed in the URL
      const response = await axiosInstance.delete(`/messages/${userId}`);
      console.log("✅ Delete response:", response.data);
  
      set({
        messages: [],
        selectedUser: null,
      });
  
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("❌ Delete chat error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to delete chat");
    }
  },
}));