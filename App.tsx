import { useEffect, useContext } from 'react';
import { Language } from './common/model/types';
import Login from './components/Login';
import { ShopSmartContext } from './context/ShopSmartContext/ShopSmartContext';
import ListOfLists from './components/ListOfLists';
import {} from './configuration/icons';
import SingleListView from './components/SingleListView/SingleListView';
import { NotificationToast } from './components/NotificationToast';
import { UserContext } from './context/UserContext';
import useFirebaseNotifications from '.';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

export default function App() {
  const { setNotification } = useContext(ShopSmartContext);
  const { lang, user, isAuthLoading, t } = useContext(UserContext);
  const { activeListId } = useContext(ShopSmartContext);
  useFirebaseNotifications();
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
      <BrowserRouter>
        <Routes>
          {/* If no user, everything redirects to Login */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

          {/* Main Dashboard */}
          <Route path="/" element={user ? <ListOfLists /> : <Navigate to="/login" />} />

          {/* View a specific list - this works for shared links too! */}
          <Route path="/list/:listId" element={user ? <SingleListView /> : <Navigate to="/login" />} />
        </Routes>
        <NotificationToast onDismiss={() => setNotification(null)} />
      </BrowserRouter>
    </div>
  );
}
