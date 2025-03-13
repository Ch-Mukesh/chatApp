import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, User, LogOut, Unplug, ScreenShare, MessageSquareLock } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

function Navbar() {
  const { authUser, logout } = useAuthStore();
  
  const handleLogOut = ()=>{
    logout();
    <Navigate to="/login"/>
  }

  return (
    <header className="bg-base-100 border-b fixed w-full border-base-300 top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-3 h-12">
        <div className="flex items-center justify-between h-full">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquareLock className="w-5 h-5 text-yellow-400" />
              </div>
              <h1 className="text-lg font-bold">Connectt</h1>
            </Link>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex items-center gap-2">
            {authUser && (
              <Link
                to="/settings"
                className="btn btn-sm gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}

            {authUser ? (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                </Link>
                <button className="btn btn-sm gap-2" onClick={handleLogOut}>
                  <LogOut className="size-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
