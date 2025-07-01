import React, { useState, useEffect, useRef } from "react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export const MainFormSection = (): JSX.Element => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/movies-search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data?.results || []);
          setShowDropdown(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    // eslint-disable-next-line
  }, [query]);

  return (
    <div className="flex flex-wrap max-w-[480px] items-end gap-4 px-4 py-3">
      <div className="flex flex-col min-w-40 items-start w-full relative">
        <div className="w-full mb-2">
          <Label
            htmlFor="movie-search"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Search for a movie
          </Label>
        </div>

        <Input
          id="movie-search"
          placeholder="Movie title"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="h-14 px-4 py-4 bg-[#472326] rounded-lg text-base font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#c69193] placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute top-20 left-0 w-full bg-[#472326] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {results.map((movie, idx) => (
              <div key={movie.id || idx} className="px-4 py-2 text-[#c69193] hover:bg-[#663335] cursor-pointer">
                {movie.title} {movie.year ? `(${movie.year})` : ""}
              </div>
            ))}
          </div>
        )}
        {loading && <div className="absolute top-20 left-0 w-full text-center text-[#c69193]">Loading...</div>}
      </div>
    </div>
  );
};
