import React from "react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

export const Dates = (): JSX.Element => {
  const pastDates = [
    {
      movie: "The Enchanted Forest",
      date: "December 15, 2023",
      location: "AMC Theater",
      herRating: 5,
      hisRating: 4,
    },
    {
      movie: "Midnight in Paris",
      date: "November 28, 2023", 
      location: "Regal Cinema",
      herRating: 4,
      hisRating: 5,
    },
  ];

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

            <div className="grid gap-6 p-4">
              {pastDates.map((dateEntry, index) => (
                <Card key={index} className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica]">
                      {dateEntry.movie}
                    </CardTitle>
                    <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                      {dateEntry.date} · {dateEntry.location}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-['Plus_Jakarta_Sans',Helvetica]">Her Rating</span>
                      <div className="flex items-center gap-4 flex-1 ml-4">
                        <Progress
                          value={dateEntry.herRating * 20}
                          className="h-1 flex-1 bg-[#663335] rounded-sm"
                          indicatorClassName="bg-[#e82833] rounded-sm"
                        />
                        <span className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-sm">
                          {dateEntry.herRating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-['Plus_Jakarta_Sans',Helvetica]">His Rating</span>
                      <div className="flex items-center gap-4 flex-1 ml-4">
                        <Progress
                          value={dateEntry.hisRating * 20}
                          className="h-1 flex-1 bg-[#663335] rounded-sm"
                          indicatorClassName="bg-[#e82833] rounded-sm"
                        />
                        <span className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-sm">
                          {dateEntry.hisRating}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};