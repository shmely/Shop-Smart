import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";
import { Language } from "@/types";
import { useContext } from "react";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

interface UserDropdownProps {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  imageError: boolean;
  getInitials: (name: string) => string;
}

export default function UserDropdown({ 
  showDropdown, 
  setShowDropdown, 
  imageError, 
  getInitials 
}: UserDropdownProps) {
  const { user, lang, setLang, setUser } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowDropdown(false);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!showDropdown) return null;

  return (
    <div
      className={`absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 ${
        lang === Language.HE ? "right-0" : "left-0"
      }`}
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {!imageError && user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {getInitials(user.displayName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user.displayName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.displayName || t.welcome}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={() => {
            setLang(lang === Language.HE ? Language.EN : Language.HE);
            setShowDropdown(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
        >
          <span className="text-lg">🌐</span>
          <span>{t.change_language}</span>
          <span className="ml-auto text-sm text-gray-500">
            {lang === Language.HE ? "English" : "עברית"}
          </span>
        </button>

        <button
          onClick={() => {
            // Add your settings logic here
            setShowDropdown(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
        >
          <span className="text-lg">⚙️</span>
          <span>{t.settings}</span>
        </button>

        <div className="border-t border-gray-100 my-1"></div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
}