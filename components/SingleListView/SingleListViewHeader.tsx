import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/configuration/icons';
import SettingsIcon from '@mui/icons-material/Settings';
import { useContext } from 'react';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';

interface Props {
  onOpenSettings: () => void;
}

export default function SingleListViewHeader({ onOpenSettings }: Props) {
  const { activeList, updateActiveList } = useContext(ShopSmartContext);
  
  const navigate = useNavigate();

  const handleBack = () => {
    // 1. Clear the active list in context/localStorage
    updateActiveList(null);

    // 2. Change the URL back to the dashboard
    navigate('/');
  };
  return (
    <header className="bg-white shadow-sm top-0 z-10 relative">
      <div className="flex items-center justify-between p-4">
        <button onClick={handleBack} className="p-2 -ml-2 rtl:-mr-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate flex-1 text-center mx-2">{activeList?.name}</h1>
        <div className="flex gap-2">
          <button onClick={onOpenSettings} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
