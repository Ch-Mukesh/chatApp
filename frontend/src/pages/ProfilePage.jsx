import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

function ProfilePage() {
  const { authUser, isUpdatingProfile, updateprofile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };

    const compressedFile = await imageCompression(file, options);
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      setIsUploading(true);

      await updateprofile({ profilePic: base64Image });

      setIsUploading(false);
    };
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 p-4 mt-10">
      <div className="bg-base-200 shadow-lg rounded-2xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>

        <div className="relative inline-block mb-4">
          {isUploading ? (
            <div className="w-24 h-24 rounded-full border-4 border-base-300 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-base-content" />
            </div>
          ) : (
            <img
              src={selectedImage || authUser?.profilePic || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border border-base-300"
            />
          )}

          <label className="absolute bottom-0 right-0 bg-base-300 p-2 rounded-full cursor-pointer">
            <Upload className="w-4 h-4 text-base-content" />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <p className="text-lg font-semibold">{authUser.fullName || "User Name"}</p>
        <p className="text-base-content/70">{authUser?.email || "user@example.com"}</p>

        <p className="text-base-content mt-2">
          <span className="font-semibold">Account Status: </span> 
          <span className="ml-1 px-2 py-1 rounded-full text-sm bg-success text-success-content">
            Active
          </span>
        </p>

        <p className="text-base-content mt-1">
          <span className="font-semibold">Account Since: </span> 
          {authUser?.createdAt?.split("T")[0] || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;