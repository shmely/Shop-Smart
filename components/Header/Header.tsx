import { useContext, useState, useRef, useEffect } from 'react';
import UserDropdown from './UserDropdown';
import { UserContext } from '@/context/UserContext';

export default function Header() {
  const { user, t } = useContext(UserContext);
  const [imageError, setImageError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Move the early return AFTER all hooks
  if (!user) return null;

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm p-4 top-0 z-10 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowDropdown(!showDropdown)}>
            {!imageError && user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-emerald-500" onError={handleImageError} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                {getInitials(user.displayName)}
              </div>
            )}
          </div>

          <UserDropdown showDropdown={showDropdown} setShowDropdown={setShowDropdown} imageError={imageError} getInitials={getInitials} />
        </div>

        <div>
          <h2 className="font-bold text-gray-800 text-lg">
            {t.welcome}, {user.displayName.split(' ')[0]}
          </h2>
        </div>
      </div>
    </header>
  );
}
