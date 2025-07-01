import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { Button } from "../../../../components/ui/button";
import { Calendar } from "../../../../components/ui/calendar";
import { Label } from "../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

export const PhotoUploadSection = (): JSX.Element => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-wrap max-w-[480px] items-end gap-4 px-4 py-3">
      <div className="flex flex-col min-w-40 items-start flex-1 grow">
        <div className="flex flex-col items-start pb-2 w-full">
          <Label
            htmlFor="date"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Date
          </Label>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className="h-14 w-full justify-start p-4 bg-[#472326] border-none rounded-lg text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] font-normal text-base leading-6 hover:bg-[#472326]/90 hover:text-[#c69193]"
            >
              {date ? format(date, "PPP") : <span>Select&nbsp;&nbsp;date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
