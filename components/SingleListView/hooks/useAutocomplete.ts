import { useState, useEffect, useMemo } from 'react';
import { FirebaseProductCacheService } from '../../../services/firebaseProductCacheService';

export function useAutocomplete(input: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedInput = useMemo(() => {
    const timer = setTimeout(() => input, 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (input.length >= 2) {
      const newSuggestions = FirebaseProductCacheService.getSuggestions(input);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  return {
    suggestions,
    showSuggestions,
    hideSuggestions: () => setShowSuggestions(false),
    showSuggestionsAgain: () => setShowSuggestions(suggestions.length > 0),
  };
}