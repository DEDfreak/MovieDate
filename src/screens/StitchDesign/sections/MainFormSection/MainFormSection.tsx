import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import { Link, Play, Film, Tv, Clock, ArrowRight } from "lucide-react";

interface MovieData {
  id: string;
  title: string;
  year: string;
  poster?: string;
  content_type: 'movie' | 'tv_series';
  overview?: string;
  genre?: string;
}

interface IncompleteDate {
  id: number;
  movie_title: string;
  movie_poster?: string;
  content_type: 'movie' | 'tv_series';
  formatted_date: string;
  days_ago: number;
  watch_progress: number;
  location: string;
}

interface MainFormSectionProps {
  selectedMovie: MovieData | null;
  onMovieSelect: (movie: MovieData) => void;
  watchStatus: 'completed' | 'partial' | 'continued';
  watchProgress: number;
  parentDateId?: number;
  onWatchStatusChange: (status: 'completed' | 'partial' | 'continued') => void;
  onWatchProgressChange: (progress: number) => void;
  onParentDateChange: (parentId: number | undefined) => void;
}

export const MainFormSection = ({ 
  selectedMovie, 
  onMovieSelect,
  watchStatus,
  watchProgress,
  parentDateId,
  onWatchStatusChange,
  onWatchProgressChange,
  onParentDateChange
}: MainFormSectionProps): JSX.Element => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv_series'>('all');
  const [results, setResults] = useState<MovieData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showFullPlot, setShowFullPlot] = useState(false);
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [incompleteDates, setIncompleteDates] = useState<IncompleteDate[]>([]);
  const [loadingIncomplete, setLoadingIncomplete] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content-search?q=${encodeURIComponent(query)}&type=${contentType}`);
        const data = await response.json();
        if (response.ok) {
          setResults(data.results || []);
          setTotal(data.total || 0);
          setShowDropdown(true);
        } else {
          console.error('Search failed:', data.error);
          setResults([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, contentType]);

  // Load incomplete dates when showing link options
  const loadIncompleteDates = async () => {
    setLoadingIncomplete(true);
    try {
      const response = await fetch('/api/incomplete-dates');
      const data = await response.json();
      if (response.ok) {
        setIncompleteDates(data.incomplete_dates || []);
      }
    } catch (error) {
      console.error('Error loading incomplete dates:', error);
    } finally {
      setLoadingIncomplete(false);
    }
  };

  const handleMovieSelect = async (movie: MovieData) => {
    onMovieSelect(movie);
    setQuery(movie.title);
    setShowDropdown(false);
    
    // Fetch detailed movie information if it's a movie
    if (movie.content_type === 'movie' && movie.id.startsWith('tt')) {
      setLoadingDetails(true);
      try {
        const response = await fetch(`/api/movie-details?id=${encodeURIComponent(movie.id)}`);
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
    } else {
      setMovieDetails(movie);
    }
  };

  const handleLinkToIncompleteDate = (incompleteDate: IncompleteDate) => {
    // Auto-populate form with data from incomplete date
    const movieData: MovieData = {
      id: incompleteDate.id.toString(),
      title: incompleteDate.movie_title,
      year: '', // You might want to store this in incomplete dates
      poster: incompleteDate.movie_poster,
      content_type: incompleteDate.content_type
    };
    
    onMovieSelect(movieData);
    onParentDateChange(incompleteDate.id);
    onWatchStatusChange('continued');
    setQuery(incompleteDate.movie_title);
    setMovieDetails(movieData);
    setShowLinkOptions(false);
  };

  const getContentTypeIcon = (type: 'movie' | 'tv_series') => {
    return type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />;
  };

  const getStatusBadgeColor = (status: 'completed' | 'partial' | 'continued') => {
    switch (status) {
      case 'completed': return 'bg-green-900/30 text-green-400 border-green-800';
      case 'partial': return 'bg-orange-900/30 text-orange-400 border-orange-800';
      case 'continued': return 'bg-blue-900/30 text-blue-400 border-blue-800';
    }
  };

  return (
    <div className="flex flex-col max-w-[800px] gap-6 px-4 py-3">
      {/* Content Type Selection */}
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
          Content Type
        </Label>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All', icon: null },
            { value: 'movie', label: 'Movies', icon: <Film className="w-4 h-4" /> },
            { value: 'tv_series', label: 'TV Series', icon: <Tv className="w-4 h-4" /> }
          ].map((type) => (
            <Button
              key={type.value}
              variant={contentType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentType(type.value as any)}
              className={`flex items-center gap-2 ${
                contentType === type.value 
                  ? 'bg-[#e82833] text-white hover:bg-[#c62229]' 
                  : 'bg-[#472326] text-[#c69193] border-[#663335] hover:bg-[#663335] hover:text-white'
              }`}
            >
              {type.icon}
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Link to Incomplete Date Option */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
            Continue Watching?
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!showLinkOptions) {
                loadIncompleteDates();
              }
              setShowLinkOptions(!showLinkOptions);
            }}
            className="bg-[#472326] text-[#c69193] border-[#663335] hover:bg-[#663335] hover:text-white flex items-center gap-2"
          >
            <Link className="w-4 h-4" />
            {showLinkOptions ? 'Hide' : 'Link to previous date'}
          </Button>
        </div>

        {/* Incomplete Dates List */}
        {showLinkOptions && (
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-4">
              {loadingIncomplete ? (
                <div className="flex items-center gap-3 text-[#c69193] py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#c69193] border-t-transparent"></div>
                  <span>Loading incomplete dates...</span>
                </div>
              ) : incompleteDates.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-[#a08082] mx-auto mb-2" />
                  <p className="text-[#c69193] text-sm">No incomplete dates found</p>
                  <p className="text-[#a08082] text-xs mt-1">Start watching something and mark it as partial to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">Continue watching from:</h4>
                  {incompleteDates.map((date) => (
                    <div
                      key={date.id}
                      onClick={() => handleLinkToIncompleteDate(date)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#3d1f22] hover:bg-[#663335] cursor-pointer transition-colors border border-[#663335] hover:border-[#8a4a4d]"
                    >
                      {date.movie_poster && (
                        <img 
                          src={date.movie_poster} 
                          alt={date.movie_title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getContentTypeIcon(date.content_type)}
                          <h5 className="text-white font-medium text-sm truncate">{date.movie_title}</h5>
                        </div>
                        <p className="text-[#a08082] text-xs">{date.formatted_date} • {date.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={date.watch_progress} className="h-1 flex-1" />
                          <span className="text-[#c69193] text-xs">{date.watch_progress}%</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#a08082]" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Section */}
      <div className="flex flex-col min-w-40 items-start w-full relative">
        <div className="w-full mb-2">
          <Label
            htmlFor="movie-search"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            {parentDateId ? 'Continuing' : 'Search for'} {contentType === 'all' ? 'content' : contentType === 'movie' ? 'a movie' : 'a TV series'}
          </Label>
          {parentDateId && (
            <Badge className="ml-2 bg-blue-900/30 text-blue-400 border-blue-800">
              Linked to previous date
            </Badge>
          )}
        </div>

        <div className="relative w-full">
          <Input
            id="movie-search"
            placeholder={`${contentType === 'tv_series' ? 'TV series' : contentType === 'movie' ? 'Movie' : 'Movie or TV series'} title`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-14 px-4 py-4 bg-[#472326] rounded-lg text-base font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#c69193] placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            autoComplete="off"
          />
          
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#c69193] border-t-transparent"></div>
            </div>
          )}
        </div>
        
        {/* Dropdown */}
        {showDropdown && results.length > 0 && !loading && (
          <div className="absolute top-20 left-0 w-full bg-[#472326] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto border border-[#663335]">
            {results.map((item, idx) => (
              <div 
                key={item.id} 
                className="px-4 py-3 text-[#c69193] hover:bg-[#663335] cursor-pointer border-b border-[#663335] last:border-b-0 transition-colors"
                onClick={() => handleMovieSelect(item)}
              >
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(item.content_type)}
                  <div className="flex-1">
                    <div className="font-medium">{item.title} ({item.year})</div>
                    {item.genre && (
                      <div className="text-xs text-[#a08082] mt-1">{item.genre}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs border-[#663335] text-[#a08082]">
                    {item.content_type === 'movie' ? 'Movie' : 'TV Series'}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 text-xs text-[#a08082] bg-[#3d1f22] border-t border-[#663335]">
              {total} result{total !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
        
        {query && !loading && results.length === 0 && !showDropdown && (
          <div className="absolute top-20 left-0 w-full bg-[#472326] rounded-lg shadow-lg z-10 px-4 py-3 border border-[#663335]">
            <p className="text-[#c69193] text-sm">No {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV series'} found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Watch Status and Progress */}
      {selectedMovie && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Watch Status */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
                Watch Status
              </Label>
              <Select value={watchStatus} onValueChange={onWatchStatusChange}>
                <SelectTrigger className="h-12 bg-[#472326] border-[#663335] text-[#c69193]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#472326] border-[#663335]">
                  <SelectItem value="completed" className="text-[#c69193] focus:bg-[#663335] focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="partial" className="text-[#c69193] focus:bg-[#663335] focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Partially watched
                    </div>
                  </SelectItem>
                  <SelectItem value="continued" className="text-[#c69193] focus:bg-[#663335] focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Continued from previous
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Watch Progress */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
                Watch Progress ({watchProgress}%)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={watchProgress}
                  onChange={(e) => onWatchProgressChange(parseInt(e.target.value))}
                  className="flex-1 h-12 bg-[#472326] border-[#663335]"
                />
                <Badge className={getStatusBadgeColor(watchStatus)}>
                  {watchProgress}%
                </Badge>
              </div>
              <Progress value={watchProgress} className="h-2 mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* Movie/Series Details Section */}
      {selectedMovie && (
        <div className="w-full">
          {loadingDetails ? (
            <Card className="bg-[#472326] border-[#663335]">
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-[#c69193]">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c69193] border-t-transparent"></div>
                  <span className="text-base">Loading details...</span>
                </div>
              </CardContent>
            </Card>
          ) : movieDetails ? (
            <Card className="bg-[#472326] border-[#663335] overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
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
                  
                  <div className="flex-1 p-6 text-[#c69193]">
                    <div className="flex items-center gap-3 mb-4">
                      {getContentTypeIcon(selectedMovie.content_type)}
                      <h3 className="text-2xl font-bold text-white">
                        {movieDetails.title} ({movieDetails.year || selectedMovie.year})
                      </h3>
                      <Badge className={getStatusBadgeColor(watchStatus)}>
                        {watchStatus === 'completed' ? 'Completed' : 
                         watchStatus === 'partial' ? 'To be continued' : 
                         'Continuation'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {movieDetails.genre && (
                        <p><span className="font-semibold text-white">Genre:</span> {movieDetails.genre}</p>
                      )}
                      {movieDetails.director && (
                        <p><span className="font-semibold text-white">Director:</span> {movieDetails.director}</p>
                      )}
                      {movieDetails.runtime && (
                        <p><span className="font-semibold text-white">Runtime:</span> {movieDetails.runtime}</p>
                      )}
                      {movieDetails.imdbRating && movieDetails.imdbRating !== 'N/A' && (
                        <p><span className="font-semibold text-white">IMDb Rating:</span> {movieDetails.imdbRating}/10</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {(movieDetails.plot || movieDetails.overview) && (
                  <div className="border-t border-[#663335] px-6 py-4">
                    <p className="font-semibold text-white mb-2">
                      {selectedMovie.content_type === 'movie' ? 'Plot:' : 'Overview:'}
                    </p>
                    <p className="text-sm leading-relaxed text-[#c69193]">
                      {movieDetails.plot || movieDetails.overview}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};
