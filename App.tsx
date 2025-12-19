import { useEffect, useContext } from 'react';
import { Language } from './common/model/types';
import Login from './components/Login';
import { ShopSmartContext } from './context/ShopSmartContext/ShopSmartContext';
import ListOfLists from './components/ListOfLists';
import {} from './configuration/icons';
import SingleListView from './components/SingleListView/SingleListView';
import { NotificationToast } from './components/NotificationToast';
import { UserContext } from './context/UserContext';

export default function App() {
  const { setNotification } = useContext(ShopSmartContext);
  const { lang, user, isAuthLoading, t } = useContext(UserContext);
  const { activeListId } = useContext(ShopSmartContext);

  useEffect(() => {
    document.documentElement.dir = lang === Language.HE ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-teal-600">{t.loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? <Login /> : !activeListId ? <ListOfLists /> : <SingleListView />}
      <NotificationToast onDismiss={() => setNotification(null)} />
    </div>
  );
}
