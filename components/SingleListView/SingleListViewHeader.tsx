import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@/configuration/icons';
import SettingsIcon from '@mui/icons-material/Settings';
import { useContext, useState } from 'react';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';
import { GroupedItem } from '@/common/model/types';
import GeneralItemsModal from './modal/GeneralItemsModal';
import { Box, IconButton } from '@mui/material';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';

interface Props {
  onOpenSettings: () => void;
  GroupedItems: GroupedItem[];
}

export default function SingleListViewHeader({ onOpenSettings, GroupedItems }: Props) {
  const { activeList, updateActiveList } = useContext(ShopSmartContext);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    // 1. Clear the active list in context/localStorage
    updateActiveList(null);

    // 2. Change the URL back to the dashboard
    navigate('/');
  };

  const handleUpdateGeneralItems = (selectedItems) => {
    // selectedItems: { [productId]: { checked: boolean, quantity: number } }
    // Update your list with these items and quantities
    // You may want to call a context or prop function here
    // Example:
    // props.onUpdateListItems(selectedItems);
  };

  return (
    <header className="bg-white shadow-sm top-0 z-10 relative">
      <GeneralItemsModal
        open={showGeneralModal}
        onClose={() => setShowGeneralModal(false)}
        onUpdate={handleUpdateGeneralItems}
      />
      <div className="flex items-center justify-between p-4">
        <IconButton onClick={handleBack} className="p-2 -ml-2 rtl:-mr-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-lg font-bold text-gray-800 truncate flex-1 text-center mx-2">{activeList?.name}</h1>
        <div className="flex gap-2">
          <IconButton
            title="הוסף פריטים כלליים"
            onClick={() => setShowGeneralModal(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ChecklistRtlIcon />
            <span style={{ marginRight: 8, fontSize: '0.95rem' }}>פריטים שאני קונה בד"כ</span>
          </IconButton>
          <IconButton onClick={onOpenSettings} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
