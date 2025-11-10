import React from "react";
import {
  Home as HomeIcon,
  Plus as PlusIcon,
  LogOut as LogOutIcon,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/Authcontext";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const currentPage =
    location.pathname === "/home"
      ? "home"
      : location.pathname === "/create-deck"
      ? "create-deck"
      : "";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <BookOpenIcon size={24} />
            <h1 className="text-xl font-bold">FlashLearn5</h1>
          </div>

          <nav className="flex items-center space-x-4">
            <button
              className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                currentPage === "home"
                  ? "bg-indigo-700"
                  : "hover:bg-indigo-700 transition-colors"
              }`}
              onClick={() => navigate("/home")}
            >
              <HomeIcon size={18} />
              <span>Home</span>
            </button>

            <button
              className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                currentPage === "create-deck"
                  ? "bg-indigo-700"
                  : "hover:bg-indigo-700 transition-colors"
              }`}
              onClick={() => navigate("/create-deck")}
            >
              <PlusIcon size={18} />
              <span>Create Deck</span>
            </button>

            <button
              className="flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
              onClick={logout}
            >
              <LogOutIcon size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <p>FlashLearn - Your AI-Powered Study Companion</p>
      </footer>
    </div>
  );
};

export default MainLayout;