import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const UserInputSection = (): JSX.Element => {
  return (
    <Card className="border-0 p-4 w-full">
      <CardContent className="flex items-center justify-center p-8 rounded-lg">
        {/* <p className="font-normal text-sm text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] leading-[21px] text-center">
          Select a movie from the search above to continue
        </p> */}
      </CardContent>
    </Card>
  );
};
