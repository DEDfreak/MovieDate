import React, { useState, useEffect } from "react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

interface MovieDate {
  id: number;
  movie_title: string;
  movie_year: string;
  movie_poster?: string;
  date_watched: string;
  location: string;
  user1_rating: number;
  user2_rating: number;
  user1_review: string;
  user2_review: string;
  created_at: string;
}

export const Dates = (): JSX.Element => {
  const [movieDates, setMovieDates] = useState<MovieDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchMovieDates();
  }, []);

  const fetchMovieDates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/movie-dates');
      const data = await response.json();
      
      if (response.ok) {
        setMovieDates(data.dates || []);
        setError("");
      } else {
        setError(data.message || 'Failed to fetch movie dates');
      }
    } catch (err) {
      console.error('Error fetching movie dates:', err);
      setError('Failed to fetch movie dates');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="flex flex-col w-full bg-[#211111] min-h-screen">
          <AddDateSection />
          <div className="flex justify-center items-center flex-1">
            <div className="flex items-center gap-3 text-[#c69193]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c69193] border-t-transparent"></div>
              <span className="text-lg">Loading your movie dates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex flex-col w-full bg-[#211111] min-h-screen">
        <AddDateSection />
        
        <div className="flex justify-center px-40 py-5 w-full">
          <div className="flex flex-col max-w-[960px] w-[960px] py-5">
            <div className="flex flex-wrap justify-around gap-[12px] p-4 w-full">
              <div className="flex flex-col w-72">
                <h1 className="font-bold text-white text-[32px] leading-10 font-['Plus_Jakarta_Sans',Helvetica]">
                  My Dates
                </h1>
                <p className="font-normal text-[#c69193] text-base font-['Plus_Jakarta_Sans',Helvetica] mt-2">
                  Your cinema date history and memories
                </p>
              </div>
            </div>

            {error && (
              <div className="mx-4 mb-6 p-4 bg-red-900/30 text-red-400 border border-red-800 rounded-lg">
                <p className="font-medium">Error: {error}</p>
                <button 
                  onClick={fetchMovieDates}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            <div className="grid gap-6 p-4">
              {movieDates.length === 0 ? (
                <Card className="bg-[#472326] border-0">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-white font-bold text-lg mb-2 font-['Plus_Jakarta_Sans',Helvetica]">
                        No movie dates yet
                      </h3>
                      <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] mb-4">
                        Start by adding your first movie date!
                      </p>
                      <a 
                        href="/"
                        className="inline-block bg-[#e82833] hover:bg-[#c62229] text-white px-6 py-2 rounded-lg font-bold transition-colors"
                      >
                        Add Your First Date
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                movieDates.map((dateEntry) => (
                  <Card key={dateEntry.id} className="bg-[#472326] border-0">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {dateEntry.movie_poster && (
                          <img 
                            src={dateEntry.movie_poster} 
                            alt={dateEntry.movie_title}
                            className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] mb-1">
                            {dateEntry.movie_title} {dateEntry.movie_year && `(${dateEntry.movie_year})`}
                          </CardTitle>
                          <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                            {formatDate(dateEntry.date_watched)} · {dateEntry.location}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-['Plus_Jakarta_Sans',Helvetica]">Her Rating</span>
                        <div className="flex items-center gap-4 flex-1 ml-4">
                          <Progress
                            value={(dateEntry.user1_rating / 10) * 100}
                            className="h-1 flex-1 bg-[#663335] rounded-sm"
                            indicatorClassName="bg-[#e82833] rounded-sm"
                          />
                          <span className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-sm w-8 text-right">
                            {dateEntry.user1_rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-['Plus_Jakarta_Sans',Helvetica]">His Rating</span>
                        <div className="flex items-center gap-4 flex-1 ml-4">
                          <Progress
                            value={(dateEntry.user2_rating / 10) * 100}
                            className="h-1 flex-1 bg-[#663335] rounded-sm"
                            indicatorClassName="bg-[#e82833] rounded-sm"
                          />
                          <span className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-sm w-8 text-right">
                            {dateEntry.user2_rating}
                          </span>
                        </div>
                      </div>
                      
                      {/* Reviews */}
                      {(dateEntry.user1_review || dateEntry.user2_review) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#663335]">
                          {dateEntry.user1_review && (
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2 font-['Plus_Jakarta_Sans',Helvetica]">
                                Her Review
                              </h4>
                              <p className="text-[#c69193] text-sm font-['Plus_Jakarta_Sans',Helvetica] leading-relaxed">
                                {dateEntry.user1_review}
                              </p>
                            </div>
                          )}
                          {dateEntry.user2_review && (
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2 font-['Plus_Jakarta_Sans',Helvetica]">
                                His Review
                              </h4>
                              <p className="text-[#c69193] text-sm font-['Plus_Jakarta_Sans',Helvetica] leading-relaxed">
                                {dateEntry.user2_review}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};