import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { AddDateSection } from "./sections/AddDateSection";
import { MainFormSection } from "./sections/MainFormSection";
import { MovieSelectionSection } from "./sections/MovieSelectionSection";
import { PhotoUploadSection } from "./sections/PhotoUploadSection";
import { RatingsSection } from "./sections/RatingsSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { UserInputSection } from "./sections/UserInputSection";

interface MovieData {
  id: string;
  title: string;
  year: string;
  poster?: string;
}

interface FormData {
  movie: MovieData | null;
  date: Date | undefined;
  location: string;
  herRating: number;
  hisRating: number;
  herReview: string;
  hisReview: string;
}

export const StitchDesign = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    movie: null,
    date: undefined,
    location: "",
    herRating: 5,
    hisRating: 4,
    herReview: "",
    hisReview: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAddDate = async () => {
    // Validation
    if (!formData.movie) {
      setSubmitMessage("Please select a movie");
      return;
    }
    if (!formData.date) {
      setSubmitMessage("Please select a date");
      return;
    }
    if (!formData.location.trim()) {
      setSubmitMessage("Please enter a location");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const payload = {
        movie_id: formData.movie.id,
        movie_title: formData.movie.title,
        movie_year: formData.movie.year,
        movie_poster: formData.movie.poster || null,
        date_watched: formData.date.toISOString(),
        location: formData.location,
        user1_rating: formData.herRating,
        user2_rating: formData.hisRating,
        user1_review: formData.herReview,
        user2_review: formData.hisReview,
        photos: []
      };

      const response = await fetch('/api/movie-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage("Movie date added successfully! 🎉");
        // Reset form after successful submission
        setFormData({
          movie: null,
          date: undefined,
          location: "",
          herRating: 5,
          hisRating: 4,
          herReview: "",
          hisReview: "",
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSubmitMessage(""), 3000);
      } else {
        setSubmitMessage(`Error: ${result.message || 'Failed to add movie date'}`);
      }
    } catch (error) {
      console.error('Error adding movie date:', error);
      setSubmitMessage("Error: Failed to add movie date. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex flex-col w-full bg-[#211111]">
        <div className="flex flex-col w-full">
          <AddDateSection />

          <div className="flex justify-center px-40 py-5 w-full">
            <div className="flex flex-col max-w-[960px] w-[960px] py-5">
              <div className="flex flex-wrap justify-around gap-[12px] p-4 w-full">
                <div className="flex flex-col w-72">
                  <h1 className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-white text-[32px] leading-10">
                    Add a Date
                  </h1>
                </div>
              </div>

              <MainFormSection 
                selectedMovie={formData.movie}
                onMovieSelect={(movie) => updateFormData({ movie })}
              />
              <UserInputSection />
              <PhotoUploadSection 
                date={formData.date}
                location={formData.location}
                onDateChange={(date) => updateFormData({ date })}
                onLocationChange={(location) => updateFormData({ location })}
              />
              <RatingsSection 
                herRating={formData.herRating}
                hisRating={formData.hisRating}
                onHerRatingChange={(herRating) => updateFormData({ herRating })}
                onHisRatingChange={(hisRating) => updateFormData({ hisRating })}
              />

              {/* Reviews Section */}
              <div className="flex flex-col gap-4 px-4 py-3 max-w-[800px]">
                <h2 className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-white text-lg leading-[23px] mb-2">
                  Your Reviews
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#472326] border-[#663335]">
                    <CardContent className="p-4">
                      <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica] mb-3 block">
                        Her Review
                      </Label>
                      <Textarea
                        value={formData.herReview}
                        onChange={(e) => updateFormData({ herReview: e.target.value })}
                        className="min-h-32 bg-[#3d1f22] border-[#663335] rounded-lg text-[#c69193] resize-none placeholder:text-[#a08082] focus-visible:ring-1 focus-visible:ring-[#e82833] focus-visible:ring-offset-0"
                        placeholder="Enter her review"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#472326] border-[#663335]">
                    <CardContent className="p-4">
                      <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica] mb-3 block">
                        His Review
                      </Label>
                      <Textarea
                        value={formData.hisReview}
                        onChange={(e) => updateFormData({ hisReview: e.target.value })}
                        className="min-h-32 bg-[#3d1f22] border-[#663335] rounded-lg text-[#c69193] resize-none placeholder:text-[#a08082] focus-visible:ring-1 focus-visible:ring-[#e82833] focus-visible:ring-offset-0"
                        placeholder="Enter his review"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <ReviewsSection />

              {/* Submit Message */}
              {submitMessage && (
                <div className="flex px-4 py-2 w-full max-w-[800px]">
                  <div className={`w-full p-3 rounded-lg text-center font-medium ${
                    submitMessage.includes('successfully') 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {submitMessage}
                  </div>
                </div>
              )}

              {/* Add Date Button */}
              <div className="flex px-4 py-3 w-full max-w-[800px]">
                <Button 
                  onClick={handleAddDate}
                  disabled={isSubmitting}
                  className="flex min-w-[84px] h-12 flex-1 justify-center bg-[#e82833] rounded-lg text-white hover:bg-[#c62229] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-base">
                        Adding...
                      </span>
                    </div>
                  ) : (
                    <span className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-base text-center leading-[21px]">
                      Add Date
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
