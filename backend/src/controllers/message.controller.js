import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/users.model.js";
import mongoose from "mongoose"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log(`Error in fetching user ${error.message}`);
        return res.status(500).json({message: "Internal Server Error!!"});
    }
}

export const getMessages = async(req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });
        
        res.status(200).json(messages);
    } catch (error) {
        console.log(`Error in getMessages ${error.message}`);
        res.status(500).json({message: "Internal Server Error!!"});
    }
}

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    // Validate message content
    if ((!text || text.trim() === "") && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    
    let imageUrl = null;
    if (image) {
      // Make sure image is a proper base64 string before uploading
      try {
        // Check if image is already a URL (which means it's already uploaded)
        if (image.startsWith('http')) {
          imageUrl = image;
        } else {
          // Ensure the base64 string is properly formatted
          const base64Data = image.includes('base64,') 
            ? image 
            : `data:image/jpeg;base64,${image}`;
            
          const uploadResponse = await cloudinary.uploader.upload(base64Data, {
            resource_type: 'image',
            folder: 'chat_images'
          });
          
          imageUrl = uploadResponse.secure_url;
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(400).json({ message: "Failed to upload image. Please try again." });
      }
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text ? text.trim() : "",
      image: imageUrl,
    });
    
    await newMessage.save();
    
    // Get socket IDs
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);
    
    console.log(`Sending message - Receiver socket: ${receiverSocketId}, Sender socket: ${senderSocketId}`);
    
    // Emit to receiver if online
    if (receiverSocketId) {
      console.log(`Emitting to receiver ${receiverId} via socket ${receiverSocketId}`);
      io.to(receiverSocketId).emit("newMsg", newMessage);
    }
    
    // Emit to sender for real-time update
    if (senderSocketId) {
      console.log(`Emitting to sender ${senderId} via socket ${senderSocketId}`);
      io.to(senderSocketId).emit("newMsgSent", newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(`Error in sendMessages: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

// Add delete messages endpoint
export const deleteMessages = async (req, res) => {
  try {
    console.log("✅ DELETE request received for user:", req.params.id); 
    console.log("✅ Authenticated User ID:", req.user._id); 

    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!userToChatId) {
      return res.status(400).json({ message: "User ID is required!" });
    }

    console.log("🔍 Checking existing messages between:", myId, "and", userToChatId);

    // Find messages before deletion to verify if they exist
    const existingMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    });

    console.log("📝 Existing Messages:", existingMessages.length);

    if (existingMessages.length === 0) {
      return res.status(404).json({ message: "No messages found to delete" });
    }

    // Delete messages
    const result = await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    });

    console.log("🗑 Delete Result:", result);

    res.status(200).json({ message: "Chat history deleted successfully" });

  } catch (error) {
    console.error("❌ Error in deleteMessages:", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

