import React, { useState, useEffect, useRef } from "react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Card, CardContent } from "../../../../components/ui/card";

interface MovieData {
  id: string;
  title: string;
  year: string;
  poster?: string;
}

interface MainFormSectionProps {
  selectedMovie: MovieData | null;
  onMovieSelect: (movie: MovieData) => void;
}

export const MainFormSection = ({ selectedMovie, onMovieSelect }: MainFormSectionProps): JSX.Element => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showFullPlot, setShowFullPlot] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      setTotal(0);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/movies-search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data?.results || []);
          setTotal(data?.total || 0);
          setShowDropdown(true);
        })
        .catch(() => {
          setResults([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 400);
    // eslint-disable-next-line
  }, [query]);

  // Helper to display movie title and year for both OMDB and fallback API formats
  const getMovieDisplay = (movie: any) => {
    if (movie.title && movie.year) return `${movie.title} (${movie.year})`;
    if (movie.Title && movie.Year) return `${movie.Title} (${movie.Year})`;
    if (movie.title) return movie.title;
    if (movie.Title) return movie.Title;
    return "Unknown Title";
  };

  // Get IMDb ID from movie object
  const getImdbId = (movie: any) => {
    return movie.imdbID || movie.IMDB_ID || movie.id;
  };

  // Handle movie selection from dropdown
  const handleMovieSelect = async (movie: any) => {
    const movieData: MovieData = {
      id: getImdbId(movie),
      title: movie.Title || movie.title || "Unknown Title",
      year: movie.Year || movie.year || "",
      poster: movie.Poster || movie.poster || undefined,
    };
    
    onMovieSelect(movieData);
    setShowDropdown(false);
    setQuery(getMovieDisplay(movie));
    setShowFullPlot(false);
    setLoading(false);
    
    const imdbId = getImdbId(movie);
    if (imdbId) {
      setLoadingDetails(true);
      try {
        const response = await fetch(`/api/movie-details?id=${encodeURIComponent(imdbId)}`);
        const data = await response.json();
        if (response.ok) {
          setMovieDetails(data.movie);
        } else {
          console.error('Failed to fetch movie details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  // Helper to truncate plot text
  const getTruncatedPlot = (plot: string, limit: number = 200) => {
    if (!plot || plot.length <= limit) return plot;
    return plot.substring(0, limit) + "...";
  };

  return (
    <div className="flex flex-col max-w-[800px] gap-6 px-4 py-3">
      {/* Search Section */}
      <div className="flex flex-col min-w-40 items-start w-full relative">
        <div className="w-full mb-2">
          <Label
            htmlFor="movie-search"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Search for a movie
          </Label>
        </div>

        <div className="relative w-full">
          <Input
            id="movie-search"
            placeholder="Movie title"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-14 px-4 py-4 bg-[#472326] rounded-lg text-base font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#c69193] placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            autoComplete="off"
          />
          
          {/* Loading indicator inside search bar */}
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#c69193] border-t-transparent"></div>
            </div>
          )}
        </div>
        
        {/* Dropdown */}
        {showDropdown && results.length > 0 && !loading && (
          <div className="absolute top-20 left-0 w-full bg-[#472326] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto border border-[#663335]">
            {results.map((movie, idx) => (
              <div 
                key={getImdbId(movie) || idx} 
                className="px-4 py-3 text-[#c69193] hover:bg-[#663335] cursor-pointer border-b border-[#663335] last:border-b-0 transition-colors"
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="font-medium">{getMovieDisplay(movie)}</div>
                {/* Show additional info if available */}
                {(movie.Genre || movie.genre) && (
                  <div className="text-xs text-[#a08082] mt-1">
                    {movie.Genre || movie.genre}
                  </div>
                )}
              </div>
            ))}
            <div className="px-4 py-2 text-xs text-[#a08082] bg-[#3d1f22] border-t border-[#663335]">
              {total} result{total !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
        
        {/* No results message */}
        {query && !loading && results.length === 0 && !showDropdown && (
          <div className="absolute top-20 left-0 w-full bg-[#472326] rounded-lg shadow-lg z-10 px-4 py-3 border border-[#663335]">
            <p className="text-[#c69193] text-sm">No movies found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Movie Details Section */}
      {selectedMovie && (
        <div className="w-full">
          {loadingDetails ? (
            <Card className="bg-[#472326] border-[#663335]">
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-[#c69193]">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c69193] border-t-transparent"></div>
                  <span className="text-base">Loading movie details...</span>
                </div>
              </CardContent>
            </Card>
          ) : movieDetails ? (
            <Card className="bg-[#472326] border-[#663335] overflow-hidden">
              <CardContent className="p-0">
                {/* Top Section: Poster + Movie Info */}
                <div className="flex flex-col lg:flex-row">
                  {/* Movie Poster */}
                  {movieDetails.poster && movieDetails.poster !== 'N/A' && (
                    <div className="lg:w-48 lg:flex-shrink-0">
                      <img 
                        src={movieDetails.poster} 
                        alt={movieDetails.title}
                        className="w-full lg:w-48 h-64 lg:h-72 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Movie Info - Right side of poster */}
                  <div className="flex-1 p-6 text-[#c69193]">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {movieDetails.title} ({movieDetails.year})
                    </h3>
                    
                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {movieDetails.rated && (
                        <p><span className="font-semibold text-white">Rated:</span> {movieDetails.rated}</p>
                      )}
                      
                      {movieDetails.genre && (
                        <p><span className="font-semibold text-white">Genre:</span> {movieDetails.genre}</p>
                      )}
                      
                      {movieDetails.director && (
                        <p><span className="font-semibold text-white">Director:</span> {movieDetails.director}</p>
                      )}
                      
                      {movieDetails.runtime && (
                        <p><span className="font-semibold text-white">Runtime:</span> {movieDetails.runtime}</p>
                      )}
                      
                      {movieDetails.released && (
                        <p><span className="font-semibold text-white">Released:</span> {movieDetails.released}</p>
                      )}
                      
                      {movieDetails.imdbRating && movieDetails.imdbRating !== 'N/A' && (
                        <p><span className="font-semibold text-white">IMDb Rating:</span> {movieDetails.imdbRating}/10</p>
                      )}
                      
                      {movieDetails.boxOffice && movieDetails.boxOffice !== 'N/A' && (
                        <p><span className="font-semibold text-white">Box Office:</span> {movieDetails.boxOffice}</p>
                      )}
                      
                      {movieDetails.awards && movieDetails.awards !== 'N/A' && (
                        <p className="md:col-span-2"><span className="font-semibold text-white">Awards:</span> {movieDetails.awards}</p>
                      )}
                      
                      {/* Cast */}
                      {movieDetails.actors && (
                        <p className="md:col-span-2"><span className="font-semibold text-white">Cast:</span> {movieDetails.actors}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Plot Section - Below the entire card */}
                {movieDetails.plot && movieDetails.plot !== 'N/A' && (
                  <div className="border-t border-[#663335] px-6 py-4">
                    <p className="font-semibold text-white mb-2">Plot:</p>
                    <p className="text-sm leading-relaxed text-[#c69193]">
                      {showFullPlot ? movieDetails.plot : getTruncatedPlot(movieDetails.plot)}
                    </p>
                    {movieDetails.plot.length > 200 && (
                      <button
                        onClick={() => setShowFullPlot(!showFullPlot)}
                        className="mt-2 text-sm text-white hover:text-[#c69193] underline focus:outline-none"
                      >
                        {showFullPlot ? 'Show less' : 'See more'}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#472326] border-[#663335]">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-[#c69193] text-center">Failed to load movie details. Please try again.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
