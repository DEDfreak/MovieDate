import React from "react";
import { Label } from "../../../../components/ui/label";

interface RatingsSectionProps {
  herRating: number;
  hisRating: number;
  onHerRatingChange: (rating: number) => void;
  onHisRatingChange: (rating: number) => void;
}

export const RatingsSection = ({ 
  herRating, 
  hisRating, 
  onHerRatingChange, 
  onHisRatingChange 
}: RatingsSectionProps): JSX.Element => {
  const handleSliderChange = (value: number, setter: (val: number) => void) => {
    setter(value);
  };

  return (
    <div className="flex flex-col max-w-[800px] gap-6 px-4 py-3">
      {/* Her Rating */}
      <div className="flex flex-col gap-3">
        <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
          Her Rating
        </Label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={herRating}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value), onHerRatingChange)}
              className="w-full h-2 bg-[#663335] rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #e82833 0%, #e82833 ${(herRating / 10) * 100}%, #663335 ${(herRating / 10) * 100}%, #663335 100%)`
              }}
            />
          </div>
          <div className="flex items-center justify-center w-12 h-8 bg-[#472326] rounded-md">
            <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans',Helvetica]">
              {herRating}
            </span>
          </div>
        </div>
      </div>

      {/* His Rating */}
      <div className="flex flex-col gap-3">
        <Label className="font-medium text-white text-base leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
          His Rating
        </Label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={hisRating}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value), onHisRatingChange)}
              className="w-full h-2 bg-[#663335] rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #e82833 0%, #e82833 ${(hisRating / 10) * 100}%, #663335 ${(hisRating / 10) * 100}%, #663335 100%)`
              }}
            />
          </div>
          <div className="flex items-center justify-center w-12 h-8 bg-[#472326] rounded-md">
            <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans',Helvetica]">
              {hisRating}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e82833;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e82833;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-webkit-slider-thumb:hover {
          background: #c62229;
          transform: scale(1.1);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          background: #c62229;
          transform: scale(1.1);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};
