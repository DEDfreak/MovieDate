import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { AddDateSection } from "./sections/AddDateSection";
import { HeaderSection } from "./sections/HeaderSection";
import { MainFormSection } from "./sections/MainFormSection";
import { MovieSelectionSection } from "./sections/MovieSelectionSection";
import { PhotoUploadSection } from "./sections/PhotoUploadSection";
import { RatingsSection } from "./sections/RatingsSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { UserInputSection } from "./sections/UserInputSection";

export const StitchDesign = (): JSX.Element => {
  // Review data for mapping
  const reviews = [
    { title: "Her Review", id: "her-review" },
    { title: "His Review", id: "his-review" },
  ];

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

              <MainFormSection />
              <UserInputSection />
              <PhotoUploadSection />
              <HeaderSection />
              <MovieSelectionSection />
              <RatingsSection />

              <div className="flex flex-col pt-4 pb-2 px-4 w-full">
                <h2 className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-white text-lg leading-[23px]">
                  Your Reviews
                </h2>
              </div>

              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-wrap max-w-[480px] gap-4 px-4 py-3"
                >
                  <Card className="flex flex-col min-w-40 flex-1 bg-transparent border-0">
                    <div className="flex-col pt-0 pb-2 px-0 w-full">
                      <h3 className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-medium text-white text-base leading-6">
                        {review.title}
                      </h3>
                    </div>
                    <CardContent className="p-0">
                      <Textarea
                        className="min-h-36 bg-[#472326] rounded-lg text-white border-0 resize-none"
                        placeholder={`Enter ${review.title.toLowerCase()}`}
                      />
                    </CardContent>
                  </Card>
                </div>
              ))}

              <ReviewsSection />

              <div className="flex px-4 py-3 w-full">
                <Button className="flex min-w-[84px] max-w-[480px] h-10 flex-1 justify-center bg-[#e82833] rounded-lg text-white hover:bg-[#c62229]">
                  <span className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-bold text-sm text-center leading-[21px]">
                    Add Date
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
