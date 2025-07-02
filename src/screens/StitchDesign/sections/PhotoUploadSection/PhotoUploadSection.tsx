import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
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

// Custom Calendar with Year/Month Navigation
const EnhancedCalendar = ({ 
  selected, 
  onSelect 
}: { 
  selected: Date | undefined; 
  onSelect: (date: Date | undefined) => void; 
}) => {
  const [currentMonth, setCurrentMonth] = useState(selected ? selected.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(selected ? selected.getFullYear() : new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 81 }, (_, i) => 1950 + i); // 1950 to 2030

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onSelect(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return selected.getDate() === day && 
           selected.getMonth() === currentMonth && 
           selected.getFullYear() === currentYear;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  return (
    <div className="p-3 bg-[#472326]">
      {/* Header with dropdowns and navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-[#663335] hover:bg-[#663335] rounded flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {/* Month Dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="px-2 py-1 text-sm bg-[#663335] border border-[#8a4a4d] rounded text-white hover:bg-[#7a3f42] focus:outline-none focus:ring-1 focus:ring-[#e82833]"
          >
            {months.map((month, index) => (
              <option key={index} value={index} className="bg-[#472326] text-white">
                {month}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="px-2 py-1 text-sm bg-[#663335] border border-[#8a4a4d] rounded text-white hover:bg-[#7a3f42] focus:outline-none focus:ring-1 focus:ring-[#e82833]"
          >
            {years.map((year) => (
              <option key={year} value={year} className="bg-[#472326] text-white">
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-[#663335] hover:bg-[#663335] rounded flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-[#c69193] text-center text-xs font-normal py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-8 w-8"></div>
        ))}
        
        {/* Days of the month */}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={`h-8 w-8 p-0 font-normal rounded-md transition-colors text-sm ${
              isSelected(day)
                ? 'bg-[#e82833] text-white hover:bg-[#c62229]'
                : isToday(day)
                ? 'bg-[#663335] text-white font-bold'
                : 'text-[#c69193] hover:bg-[#663335] hover:text-white'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

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
            <EnhancedCalendar selected={date} onSelect={onDateChange} />
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
          style={{ 
            color: '#c69193',
            backgroundColor: '#472326'
          }}
          className="h-14 p-4 bg-[#472326] rounded-lg !text-[#c69193] font-['Plus_Jakarta_Sans',Helvetica] font-normal text-base leading-6 placeholder:text-[#c69193] border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:!text-[#c69193] focus:bg-[#472326] active:!text-[#c69193] [&:not(:placeholder-shown)]:!text-[#c69193]"
        />
      </div>
    </div>
  );
};
