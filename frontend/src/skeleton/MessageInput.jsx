import React, { useState } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";

function MessageInput({ onSend }) {
  const [chatInput, setChatInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  // ✅ Convert Image to Base64 with error handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset states
    setImageError("");
    setIsImageLoading(true);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      setIsImageLoading(false);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      setIsImageLoading(false);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setIsImageLoading(false);
    };
    
    reader.onerror = () => {
      setImageError("Failed to read the image file. Please try again.");
      setIsImageLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // ✅ Handle Send Message (with Text + Image)
  const handleSendMessage = () => {
    if ((!chatInput.trim() && !selectedImage) || isImageLoading) return;
    
    // ✅ Pass message and image(Base64) to ChatContainer
    onSend({
      text: chatInput,
      image: selectedImage,
    });
    
    // ✅ Clear input & image after sending
    setChatInput("");
    setSelectedImage(null);
    setImageError("");
  };

  return (
    <div className="p-4 border-t border-base-300 bg-base-100">
      {/* Image Error Message */}
      {imageError && (
        <div className="text-red-500 text-sm mb-2 p-1 bg-red-50 rounded">
          {imageError}
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          id="fileInput"
          onChange={handleImageChange}
        />
        
        <label 
          htmlFor="fileInput" 
          className={`btn ${isImageLoading ? 'btn-disabled' : 'btn-secondary'} flex items-center gap-1 cursor-pointer`}
        >
          {isImageLoading ? 'Loading...' : <ImageIcon size={18} />}
        </label>
        
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
        />
        
        <button
          className="btn btn-primary"
          onClick={handleSendMessage}
          disabled={(!chatInput.trim() && !selectedImage) || isImageLoading}
        >
          <Send size={18} />
        </button>
      </div>
      
      {/* ✅ Image Preview */}
      {selectedImage && (
        <div className="absolute bottom-16 left-4 bg-white border rounded-lg p-2 flex gap-2 items-center shadow-md z-10">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="text-red-500"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageInput;