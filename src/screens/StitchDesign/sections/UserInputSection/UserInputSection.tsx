import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const UserInputSection = (): JSX.Element => {
  const movieData = {
    category: "Movie",
    title: "The Enchanted Forest",
    details: "2023 · Fantasy/Adventure",
    imageUrl: "..//depth-6--frame-1.png",
  };

  return (
    <Card className="border-0 p-4 w-full">
      <CardContent className="flex items-start justify-between p-0 gap-4 rounded-lg">
        <div className="flex flex-col items-start gap-1">
          <p className="font-normal text-sm text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] leading-[21px]">
            {movieData.category}
          </p>
          <h3 className="font-bold text-base text-white font-['Plus_Jakarta_Sans',Helvetica] leading-5 mt-0">
            {movieData.title}
          </h3>
          <p className="font-normal text-sm text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] leading-[21px]">
            {movieData.details}
          </p>
        </div>

        <div
          className="flex-1 h-[171px] rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${movieData.imageUrl})` }}
          aria-label="Movie poster for The Enchanted Forest"
        />
      </CardContent>
    </Card>
  );
};
