import React from "react";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export const Wishlist = (): JSX.Element => {
  const wishlistMovies = [
    { title: "Dune: Part Two", year: "2024", genre: "Sci-Fi/Adventure" },
    { title: "Oppenheimer", year: "2023", genre: "Biography/Drama" },
    { title: "Spider-Man: Across the Spider-Verse", year: "2023", genre: "Animation/Action" },
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
                  My Wishlist
                </h1>
                <p className="font-normal text-[#c69193] text-base font-['Plus_Jakarta_Sans',Helvetica] mt-2">
                  Movies you want to watch on future dates
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-4">
              {wishlistMovies.map((movie, index) => (
                <Card key={index} className="bg-[#472326] border-0">
                  <CardHeader>
                    <CardTitle className="text-white font-['Plus_Jakarta_Sans',Helvetica]">
                      {movie.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica]">
                      {movie.year} · {movie.genre}
                    </p>
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