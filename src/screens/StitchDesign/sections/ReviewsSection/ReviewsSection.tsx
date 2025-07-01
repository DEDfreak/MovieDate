import React from "react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

export const ReviewsSection = (): JSX.Element => {
  return (
    <section className="flex flex-col items-start p-4 w-full">
      <Card className="w-full flex flex-col items-center gap-6 px-6 py-14 rounded-lg border-2 border-dashed border-[#663335] bg-transparent">
        <CardHeader className="p-0 space-y-2 text-center">
          <CardTitle className="font-bold text-white text-lg leading-[23px] font-['Plus_Jakarta_Sans',Helvetica]">
            Upload Photos
          </CardTitle>
          <CardDescription className="font-normal text-white text-sm leading-[21px] font-['Plus_Jakarta_Sans',Helvetica]">
            Add photos to remember your date
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Button className="w-[84px] h-10 bg-[#472326] rounded-lg font-bold text-white text-sm font-['Plus_Jakarta_Sans',Helvetica]">
            Upload
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
