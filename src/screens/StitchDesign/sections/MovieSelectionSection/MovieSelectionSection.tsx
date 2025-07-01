import React from "react";
import { Progress } from "../../../../components/ui/progress";

export const MovieSelectionSection = (): JSX.Element => {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex items-center justify-between p-4 w-full">
        <div className="flex items-center">
          <div className="flex flex-col">
            <h3 className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
              Her Rating
            </h3>
          </div>
        </div>

        <div className="flex h-4 items-center gap-4 flex-1">
          <Progress
            value={70}
            className="h-1 flex-1 bg-[#663335] rounded-sm"
            indicatorClassName="bg-[#e82833] rounded-sm"
          />

          <div className="flex flex-col">
            <span className="font-normal text-white text-sm leading-[21px] font-['Plus_Jakarta_Sans',Helvetica]">
              5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
