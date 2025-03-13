import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development"? "http://localhost:8080" : "/";

export const useAuthStore = create((set,get) => ({
    authUser : null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    isCheckingAuth : true,
    onlineUsers : [],
    socket : null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth", error.response.data.message);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    

    signup: async (data) => {
        set({ isSigningUp: true }); 
        try {
            const res = await axiosInstance.post("/auth/signup", data, {
                withCredentials: true,
            });
            toast.success("Account created Successfully!!");
            set({ authUser: res.data }); 
            get().connectSocket();
            return res.data;
        } catch (error) {
            console.error(`Signup failed: ${error.response?.data?.message || error.message}`);
            toast.error(error.response.data.message);
            throw new Error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login : async (data) => {
        set( { isLoggingIn : true } );
        try {
            const res = await axiosInstance.post("/auth/login",data, { withCredentials: true });
            set({authUser : res.data});
            toast.success("LoggedIn successfully!!");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
        finally{
            set( { isLoggingIn : false } );
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser : null });
            get().disconnectSocket();
            toast.success("Logged Out Successfully!!");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateprofile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data, { withCredentials: true });
            set({ authUser: res.data });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket : ()=>{
        const { authUser } = get();
        if(!authUser || get().socket) return;

        const socket = io(BASE_URL,{
            query: {
                userId: authUser._id
            }
        });
        
        socket.connect();

        // Receive online users from the server
        socket.on("get-online-users",(users)=>{
            set({ onlineUsers: users });
        });

        set({ socket });
    },

    disconnectSocket : async()=>{
        const { socket } = get();
        if(socket){
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}))
