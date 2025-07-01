import React from "react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export const MainFormSection = (): JSX.Element => {
  return (
    <div className="flex flex-wrap max-w-[480px] items-end gap-4 px-4 py-3">
      <div className="flex flex-col min-w-40 items-start w-full">
        <div className="w-full mb-2">
          <Label
            htmlFor="movie-search"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Search for a movie
          </Label>
        </div>

        <Input
          id="movie-search"
          placeholder="Movie title"
          className="h-14 px-4 py-4 bg-[#472326] rounded-lg text-base font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#c69193] placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};
