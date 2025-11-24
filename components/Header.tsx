import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";
import { Language } from "@/types";
import { useContext } from "react";

export default function Header() {
  const { user, lang, setLang } = useContext(
    ShopSmartContext
  );
  const t = TRANSLATIONS[lang];
  if (!user) return null;
  return (
    <header className="bg-white shadow-sm p-4 top-0 z-10 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img
          src={user.avatarUrl}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-emerald-500"
        />
        <div>
          <h2 className="font-bold text-gray-800 text-lg">
            {t.welcome}, {user.name.split(" ")[0]}
          </h2>
        </div>
      </div>
      <button
        onClick={() =>
          setLang(
            lang === Language.HE
              ? Language.EN
              : Language.HE
          )
        }
        className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
      >
        {lang === Language.HE ? "EN" : "עב"}
      </button>
    </header>
  );
}
