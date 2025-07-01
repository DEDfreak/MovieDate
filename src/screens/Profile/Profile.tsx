import React from "react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage } from "../../components/ui/avatar";

export const Profile = (): JSX.Element => {
  const profileStats = {
    totalDates: 12,
    favoriteGenre: "Romance",
    averageRating: 4.2,
    favoriteTheater: "AMC Theater",
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex flex-col w-full bg-[#211111] min-h-screen">
        <AddDateSection />
        
        <div className="flex justify-center px-40 py-5 w-full">
          <div className="flex flex-col max-w-[960px] w-[960px] py-5">
            <div className="flex flex-wrap justify-around gap-[12px] p-4 w-full">
              <div className="flex flex-col w-72">
                <h1 className="font-bold text-white text-[32px] leading-10 font-['Plus_Jakarta_Sans',Helvetica]">
                  Profile
                </h1>
                <p className="font-normal text-[#c69193] text-base font-['Plus_Jakarta_Sans',Helvetica] mt-2">
                  Your cinema date statistics and preferences
                </p>
              </div>
            </div>

            <div className="p-4">
              <Card className="bg-[#472326] border-0 mb-6">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="..//depth-4--frame-2.png" alt="Profile picture" />
                  </Avatar>
                  <div>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-xl">
                      Cinema Enthusiast
                    </CardTitle>
                    <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                      Member since 2023
                    </p>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-lg">
                      Total Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#e82833] font-bold text-2xl font-['Plus_Jakarta_Sans',Helvetica]">
                      {profileStats.totalDates}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-lg">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#e82833] font-bold text-2xl font-['Plus_Jakarta_Sans',Helvetica]">
                      {profileStats.averageRating}/5
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-lg">
                      Favorite Genre
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                      {profileStats.favoriteGenre}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica] text-lg">
                      Favorite Theater
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                      {profileStats.favoriteTheater}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};