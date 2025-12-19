import { Language } from '../common/model/types';
import { useContext } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { UserContext } from '@/context/UserContext';

export default function Login() {
  const { lang, setLang, setUser, isAuthLoading, t } = useContext(UserContext);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <h1 className="text-4xl font-bold mb-2">טוען נתוני משתמש...</h1>
        <p>ממתין לשרת האימות.</p>
      </div>
    );
  }

  const handleFirebaseLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;

      setUser(firebaseUser);
      console.log('Logged in UID:', firebaseUser.uid);
    } catch (error) {
      console.error('Login Error:', error.code, error.message);

      let errorMessage = t.login_error_general;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = t.login_error_cancelled;
      }
      console.log(`Error: ${errorMessage}`);

      setUser(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
      <h1 className="text-4xl font-bold mb-2">{t.app_name}</h1>
      <p className="mb-8 opacity-90 text-lg">{t.grocery_list}</p>
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
        <button
          onClick={handleFirebaseLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          {t.login_google}
        </button>
      </div>
      <div className="mt-8 flex gap-4">
        <button onClick={() => setLang(Language.HE)} className={`font-bold ${lang === Language.HE ? 'underline' : 'opacity-50'}`}>
          עברית
        </button>
        <button onClick={() => setLang(Language.EN)} className={`font-bold ${lang === Language.EN ? 'underline' : 'opacity-50'}`}>
          English
        </button>
      </div>
    </div>
  );
}
