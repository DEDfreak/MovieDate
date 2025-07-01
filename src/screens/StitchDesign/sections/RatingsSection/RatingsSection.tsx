import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";

export const RatingsSection = (): JSX.Element => {
  return (
    <Card className="w-full bg-transparent border-0">
      <CardContent className="flex items-center justify-between p-4 w-full">
        <div className="font-medium text-white text-base font-['Plus_Jakarta_Sans',Helvetica]">
          His Rating
        </div>

        <div className="flex items-center gap-4 flex-1">
          <Progress
            value={80}
            className="h-1 flex-1 bg-[#663335] rounded-sm"
            indicatorClassName="bg-[#e82833] rounded-sm"
          />
          <span className="font-normal text-white text-sm font-['Plus_Jakarta_Sans',Helvetica] leading-[21px]">
            4
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
