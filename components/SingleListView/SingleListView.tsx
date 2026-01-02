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
  const { updateActiveList } = useContext(ShopSmartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeList = async () => {
      if (listId && user) {
        updateActiveList(listId);
        try {
          await checkAndProcessJoin(listId, user.email!, user.uid);
        } catch (error) {
          console.warn('Join check skipped or failed:', error);
          navigate('/');
        }
      }
    };

    initializeList();
  }, [listId, user, updateActiveList]);

  return (
    <div className="flex flex-col h-screen">
      <SingleListViewMain />
      <SingleListViewFooter />
    </div>
  );
}
