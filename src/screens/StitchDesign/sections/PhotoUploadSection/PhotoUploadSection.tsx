import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { Button } from "../../../../components/ui/button";
import { Calendar } from "../../../../components/ui/calendar";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

interface PhotoUploadSectionProps {
  date: Date | undefined;
  location: string;
  onDateChange: (date: Date | undefined) => void;
  onLocationChange: (location: string) => void;
}

export const PhotoUploadSection = ({ 
  date, 
  location, 
  onDateChange, 
  onLocationChange 
}: PhotoUploadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-wrap max-w-[800px] items-end gap-4 px-4 py-1">
      {/* Date Picker */}
      <div className="flex flex-col min-w-40 items-start flex-1">
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
              className="h-14 w-full justify-start p-4 bg-[#472326] border-none rounded-lg text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] font-normal text-base leading-6 hover:bg-[#472326]/90 hover:text-[#c69193] focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {date ? (
                <span className="text-[#c69193]">
                  {format(date, "MMMM d, yyyy")}
                </span>
              ) : (
                <span className="text-[#c69193]">Select date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#472326] border-[#663335]" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              className="bg-[#472326]"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-white",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-[#663335] hover:bg-[#663335]",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-[#c69193] rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal text-[#c69193] hover:bg-[#663335] hover:text-white rounded-md transition-colors",
                day_selected: "bg-[#e82833] text-white hover:bg-[#c62229] hover:text-white focus:bg-[#e82833] focus:text-white",
                day_today: "bg-[#663335] text-white font-bold",
                day_outside: "text-[#a08082] opacity-50",
                day_disabled: "text-[#a08082] opacity-30",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Location Input */}
      <div className="flex flex-col min-w-40 items-start flex-1">
        <div className="flex flex-col items-start pb-2 w-full">
          <Label
            htmlFor="cinema-location"
            className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]"
          >
            Location
          </Label>
        </div>

        <Input
          id="cinema-location"
          placeholder="Cinema name"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="h-14 p-4 bg-[#472326] rounded-lg text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] font-normal text-base leading-6 placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};
