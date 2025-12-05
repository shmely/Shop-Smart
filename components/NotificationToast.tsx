import React, { useContext, useEffect, useState } from 'react';
import { ShopSmartContext } from '@/context/ShopSmartContext';

interface Props {
  onDismiss: () => void;
}

export const NotificationToast: React.FC<Props> = ({ onDismiss }) => {
  const { notification } = useContext(ShopSmartContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = window.setTimeout(() => {
        setVisible(false);
        window.setTimeout(onDismiss, 300); // Wait for fade out animation
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification && !visible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}
    >
      <div className="bg-white/90 backdrop-blur-md text-gray-800 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase text-gray-500">ShopSmart</h4>
          <p className="text-sm font-medium leading-tight">{notification?.message}</p>
        </div>
      </div>
    </div>
  );
};
