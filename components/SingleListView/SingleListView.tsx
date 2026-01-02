import { useNavigate, useParams } from 'react-router-dom';
import SingleListViewFooter from './SingleListViewFooter';
import SingleListViewMain from './SingleListViewMain';
import { useContext, useEffect } from 'react';
import { UserContext } from '@/context/UserContext';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';
import { checkAndProcessJoin } from '@/data-layer/firebase-layer';

export default function SingleListView() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useContext(UserContext);
  const { updateActiveList, activeList } = useContext(ShopSmartContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (listId && user) {
      // 1. Tell Context which list we are looking at
      updateActiveList(listId);

      // 2. Run the "Join" check from your Firebase Layer
      checkAndProcessJoin(listId, user.email!, user.uid);
    }
  }, [listId, user, updateActiveList]);

  return (
    <div className="flex flex-col h-screen">
      <SingleListViewMain />
      <SingleListViewFooter />
    </div>
  );
}
