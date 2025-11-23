import { ShopSmartContext } from "@/context/ShopSmartContext";
import { User,Language } from "../types";
import { useContext } from "react";
import { MOCK_USER,TRANSLATIONS } from '../configuration/constants';

export default function Login() {
  const { lang, setLang } = useContext(ShopSmartContext);
  const { user, setUser } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];
  const handleLogin = () => {
    // Simulate Federated Identity Login
    setUser(MOCK_USER);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <h1 className="text-4xl font-bold mb-2">
          {t.app_name}
        </h1>
        <p className="mb-8 opacity-90 text-lg">
          {t.grocery_list}
        </p>
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            {t.login_google}
          </button>
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setLang(Language.HE)}
            className={`font-bold ${
              lang === Language.HE
                ? "underline"
                : "opacity-50"
            }`}
          >
            עברית
          </button>
          <button
            onClick={() => setLang(Language.EN)}
            className={`font-bold ${
              lang === Language.EN
                ? "underline"
                : "opacity-50"
            }`}
          >
            English
          </button>
        </div>
      </div>
    );
  }
}
