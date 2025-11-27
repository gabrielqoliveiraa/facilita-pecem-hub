import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AddressSearchProps {
  onSelectAddress: (coordinates: [number, number], address: string) => void;
  placeholder?: string;
  mapboxToken: string;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

const AddressSearch = ({ onSelectAddress, placeholder, mapboxToken }: AddressSearchProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxToken}&` +
          `country=BR&` +
          `region=CE&` +
          `limit=5&` +
          `language=pt`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erro ao buscar endereços:", error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, mapboxToken]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.place_name);
    setShowSuggestions(false);
    onSelectAddress(suggestion.center, suggestion.place_name);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Digite um endereço..."}
          className="pl-10"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
            >
              <p className="text-sm font-medium text-foreground">{suggestion.place_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;
