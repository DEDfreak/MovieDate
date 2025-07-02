import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Film, Tv, Calendar, MapPin, Play, Star, Clock, ArrowRight } from "lucide-react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";

interface MovieDate {
  id: number;
  movie_id: string;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  content_type: 'movie' | 'tv_series';
  date_watched: string;
  location: string;
  user1_rating?: number;
  user2_rating?: number;
  user1_review: string;
  user2_review: string;
  watch_status: 'completed' | 'partial' | 'continued';
  watch_progress: number;
  parent_date_id?: number;
  linked_dates?: MovieDate[];
  parent_date?: MovieDate;
  created_at: string;
}

export const Dates = (): JSX.Element => {
  const [dates, setDates] = useState<MovieDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load dates on component mount
  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/movie-dates?linked=true');
      const data = await response.json();
      
      if (response.ok) {
        setDates(data.dates || []);
      } else {
        setError(data.message || 'Failed to load dates');
      }
    } catch (err) {
      console.error('Error fetching dates:', err);
      setError('Failed to load dates');
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: 'movie' | 'tv_series') => {
    return type === 'movie' 
      ? <Film className="w-4 h-4" /> 
      : <Tv className="w-4 h-4" />;
  };

  const getStatusBadge = (status: 'completed' | 'partial' | 'continued', progress: number) => {
    const configs = {
      completed: { color: 'bg-green-900/30 text-green-400 border-green-800', label: 'Completed' },
      partial: { color: 'bg-orange-900/30 text-orange-400 border-orange-800', label: 'To be continued' },
      continued: { color: 'bg-blue-900/30 text-blue-400 border-blue-800', label: 'Continuation' }
    };
    
    const config = configs[status];
    return (
      <Badge className={config.color}>
        {config.label} {status !== 'completed' && `(${progress}%)`}
      </Badge>
    );
  };

  const getCardBorder = (status: 'completed' | 'partial' | 'continued', hasParent: boolean) => {
    if (hasParent) return 'border-l-4 border-l-green-500'; // Continuation dates
    if (status === 'partial') return 'border-l-4 border-l-orange-500'; // Incomplete dates
    return 'border-l-4 border-l-blue-500'; // Original/completed dates
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageRating = (rating1?: number, rating2?: number) => {
    if (!rating1 && !rating2) return null;
    if (!rating1) return rating2;
    if (!rating2) return rating1;
    return ((rating1 + rating2) / 2).toFixed(1);
  };

  const handleContinueWatching = (date: MovieDate) => {
    // Navigate to add date page with this movie pre-filled
    // For now, we'll show an alert (in production, use react-router)
    alert(`Continue watching "${date.movie_title}" - this would navigate to the add date form with the movie pre-selected and parent_date_id set to ${date.id}`);
  };

  // Group dates to show linked connections
  const groupLinkedDates = (dates: MovieDate[]) => {
    const grouped: { [key: string]: MovieDate[] } = {};
    const processed = new Set<number>();

    dates.forEach(date => {
      if (processed.has(date.id)) return;

      const groupKey = date.parent_date_id ? 
        dates.find(d => d.id === date.parent_date_id)?.id.toString() || date.id.toString() :
        date.id.toString();

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }

      // Add the root date
      if (!date.parent_date_id) {
        grouped[groupKey].push(date);
        processed.add(date.id);
      }

      // Add linked dates
      if (date.linked_dates) {
        date.linked_dates.forEach(linkedDate => {
          if (!processed.has(linkedDate.id)) {
            grouped[groupKey].push(linkedDate);
            processed.add(linkedDate.id);
          }
        });
      }

      // If this is a continuation date without its parent in the current dataset
      if (date.parent_date_id && !processed.has(date.id)) {
        grouped[groupKey].push(date);
        processed.add(date.id);
      }
    });

    return Object.values(grouped).map(group => 
      group.sort((a, b) => new Date(a.date_watched).getTime() - new Date(b.date_watched).getTime())
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#c69193]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c69193] border-t-transparent"></div>
              <span className="text-lg">Loading your movie dates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />
          <div className="flex-1 flex items-center justify-center px-4">
            <Card className="bg-[#472326] border-[#663335] max-w-md">
              <CardContent className="p-6 text-center">
                <div className="text-red-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Error Loading Dates</h3>
                </div>
                <p className="text-[#c69193] mb-4">{error}</p>
                <Button 
                  onClick={fetchDates}
                  className="bg-[#e82833] text-white hover:bg-[#c62229]"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const groupedDates = groupLinkedDates(dates);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex flex-col w-full bg-[#211111] min-h-screen">
        <AddDateSection />
        
        <div className="flex justify-center px-4 lg:px-40 py-8 w-full">
          <div className="flex flex-col max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Our Movie Dates</h1>
              <p className="text-[#c69193] text-lg">A timeline of our cinematic journey together</p>
            </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{dates.length}</div>
              <div className="text-sm text-[#c69193]">Total Dates</div>
            </CardContent>
          </Card>
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{dates.filter(d => d.content_type === 'movie').length}</div>
              <div className="text-sm text-[#c69193]">Movies</div>
            </CardContent>
          </Card>
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{dates.filter(d => d.content_type === 'tv_series').length}</div>
              <div className="text-sm text-[#c69193]">TV Series</div>
            </CardContent>
          </Card>
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{dates.filter(d => d.watch_status === 'partial').length}</div>
              <div className="text-sm text-[#c69193]">To Continue</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        {groupedDates.length === 0 ? (
          <Card className="bg-[#472326] border-[#663335]">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-[#a08082] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No movie dates yet!</h3>
              <p className="text-[#c69193] mb-6">Start your cinematic journey by adding your first movie date.</p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-[#e82833] text-white hover:bg-[#c62229]"
              >
                Add Your First Date
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedDates.map((group, groupIndex) => (
              <div key={groupIndex} className="relative">
                {/* Group container with subtle background for linked dates */}
                {group.length > 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3d1f22]/30 to-transparent rounded-lg -m-2"></div>
                )}
                
                <div className="relative space-y-6">
                  {group.map((date, index) => (
                    <div key={date.id} className="relative">
                      {/* Curved Arrow for linked dates */}
                      {index > 0 && (
                        <div className="absolute -top-3 left-8 w-16 h-6 pointer-events-none">
                          <svg 
                            width="64" 
                            height="24" 
                            viewBox="0 0 64 24" 
                            className="text-[#8a4a4d]"
                          >
                            <path
                              d="M 2 2 Q 16 2 32 12 Q 48 22 62 22"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.7"
                            />
                            <path
                              d="M 58 18 L 62 22 L 58 26"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Date Card */}
                      <Card className={`bg-[#472326] border-[#663335] overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] ${getCardBorder(date.watch_status, !!date.parent_date_id)}`}>
                        <CardContent className="p-0">
                          <div className="flex flex-col lg:flex-row">
                            {/* Movie Poster */}
                            {date.movie_poster && (
                              <div className="lg:w-32 lg:flex-shrink-0">
                                <img 
                                  src={date.movie_poster} 
                                  alt={date.movie_title}
                                  className="w-full lg:w-32 h-48 lg:h-40 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 p-4">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getContentTypeIcon(date.content_type)}
                                    <h3 className="text-lg font-semibold text-white truncate">
                                      {date.movie_title} {date.movie_year && `(${date.movie_year})`}
                                    </h3>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-[#a08082]">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(date.date_watched)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {date.location}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  {getStatusBadge(date.watch_status, date.watch_progress)}
                                  
                                  {/* Average Rating */}
                                  {(() => {
                                    const avgRating = getAverageRating(date.user1_rating, date.user2_rating);
                                    return avgRating && (
                                      <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-medium">{avgRating}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                              
                              {/* Progress Bar for partial/continued */}
                              {date.watch_status !== 'completed' && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-[#c69193]">Watch Progress</span>
                                    <span className="text-xs text-[#c69193]">{date.watch_progress}%</span>
                                  </div>
                                  <Progress value={date.watch_progress} className="h-2" />
                                </div>
                              )}
                              
                              {/* Reviews */}
                              {(date.user1_review || date.user2_review) && (
                                <div className="mb-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {date.user1_review && (
                                      <div>
                                        <div className="font-medium text-white mb-1">Her Review:</div>
                                        <p className="text-[#c69193] line-clamp-2">{date.user1_review}</p>
                                      </div>
                                    )}
                                    {date.user2_review && (
                                      <div>
                                        <div className="font-medium text-white mb-1">His Review:</div>
                                        <p className="text-[#c69193] line-clamp-2">{date.user2_review}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions */}
                              {date.watch_status === 'partial' && (
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => handleContinueWatching(date)}
                                    size="sm"
                                    className="bg-[#e82833] text-white hover:bg-[#c62229] flex items-center gap-2"
                                  >
                                    <Play className="w-4 h-4" />
                                    Continue Watching
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};