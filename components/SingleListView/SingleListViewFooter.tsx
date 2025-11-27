import { useState } from "react";
import { useSingleListViewFooter } from "./hooks/useSingleListViewFooter";
import { useAutocomplete } from "./hooks/useAutocomplete";
import { PlusIcon } from "@/configuration/icons";

export default function SingleListViewFooter() {
  const {
    t,
    newItemText,
    setNewItemText,
    isCategorizing,
    handleAddItem,
  } = useSingleListViewFooter();

  const {
    suggestions,
    showSuggestions,
    hideSuggestions,
    showSuggestionsAgain,
  } = useAutocomplete(newItemText);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        handleAddItem();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleAddItem(suggestions[selectedIndex]);
        } else {
          handleAddItem();
        }
        hideSuggestions();
        setSelectedIndex(-1);
        break;
      case "Escape":
        hideSuggestions();
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleAddItem(suggestion);
    hideSuggestions();
    setSelectedIndex(-1);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 shadow-lg">
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={showSuggestionsAgain}
          onBlur={() => setTimeout(hideSuggestions, 150)} // Delay to allow click
          placeholder={t.add_item}
          className="w-full bg-gray-100 text-gray-900 rounded-full pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          disabled={isCategorizing}
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-12 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 max-h-48 overflow-y-auto z-20">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-emerald-50 text-emerald-700"
                    : "hover:bg-gray-50"
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => handleAddItem()}
          disabled={!newItemText.trim() || isCategorizing}
          className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${
            newItemText.trim()
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-300 text-gray-500"
          } rtl:right-auto rtl:left-2`}
        >
          {isCategorizing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PlusIcon />
          )}
        </button>
      </div>
      {isCategorizing && (
        <div className="text-center text-xs text-emerald-600 mt-2 font-medium animate-pulse">
          ✨ {t.smart_sort}
        </div>
      )}
    </div>
  );
}
