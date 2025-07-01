import React from "react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export const HeaderSection = (): JSX.Element => {
  return (
    <div className="flex flex-wrap max-w-[480px] items-end gap-4 px-4 py-3 relative">
      <div className="flex flex-col min-w-40 items-start relative flex-1 grow">
        <div className="flex flex-col items-start pb-2 w-full">
          <Label
            htmlFor="cinema-location"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Location
          </Label>
        </div>

        <div className="relative w-full">
          <Input
            id="cinema-location"
            placeholder="Cinema name"
            className="h-14 p-4 bg-[#472326] rounded-lg text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] font-normal text-base leading-6 placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
};
