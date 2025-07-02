import React, { useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ReviewsSectionProps {
  user1Review: string;
  user2Review: string;
  onUser1ReviewChange: (review: string) => void;
  onUser2ReviewChange: (review: string) => void;
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

export const ReviewsSection = ({ 
  user1Review, 
  user2Review, 
  onUser1ReviewChange, 
  onUser2ReviewChange,
  photos,
  onPhotosChange
}: ReviewsSectionProps): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isImage && isValidSize;
    });

    if (validFiles.length > 0) {
      onPhotosChange([...photos, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="flex flex-col max-w-[800px] gap-6 px-4 py-3">
      {/* Reviews Section */}
      <div className="flex flex-col gap-4">
        <Label className="font-medium text-white text-lg leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
          Your Reviews
        </Label>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Her Review */}
          <Card className="flex-1 bg-[#472326] border-[#663335]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base font-medium">Her Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder="Enter her review"
                value={user1Review}
                onChange={(e) => onUser1ReviewChange(e.target.value)}
                className="min-h-[120px] bg-[#3d1f22] border-[#663335] text-[#c69193] placeholder:text-[#a08082] focus-visible:ring-1 focus-visible:ring-[#e82833] focus-visible:border-[#e82833] resize-none"
              />
            </CardContent>
          </Card>

          {/* His Review */}
          <Card className="flex-1 bg-[#472326] border-[#663335]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base font-medium">His Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder="Enter his review"
                value={user2Review}
                onChange={(e) => onUser2ReviewChange(e.target.value)}
                className="min-h-[120px] bg-[#3d1f22] border-[#663335] text-[#c69193] placeholder:text-[#a08082] focus-visible:ring-1 focus-visible:ring-[#e82833] focus-visible:border-[#e82833] resize-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Photos Section */}
      <div className="flex flex-col gap-4">
        <Label className="font-medium text-white text-lg leading-6 font-['Plus_Jakarta_Sans',Helvetica]">
          Upload Photos
        </Label>
        
        <Card 
          className={`w-full flex flex-col items-center gap-6 px-6 py-8 rounded-lg border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-[#e82833] bg-[#e82833]/10' 
              : 'border-[#663335] bg-transparent hover:border-[#8a4a4d]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardHeader className="p-0 space-y-2 text-center">
            <div className="mx-auto w-12 h-12 bg-[#472326] rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#c69193]" />
            </div>
            <CardTitle className="font-bold text-white text-lg leading-[23px] font-['Plus_Jakarta_Sans',Helvetica]">
              {photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} selected` : 'Upload Photos'}
            </CardTitle>
            <CardDescription className="font-normal text-[#c69193] text-sm leading-[21px] font-['Plus_Jakarta_Sans',Helvetica]">
              Add photos to remember your date
            </CardDescription>
            <CardDescription className="font-normal text-[#a08082] text-xs">
              Drag & drop images here or click to browse (Max 5MB each)
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#472326] hover:bg-[#5a2b2f] rounded-lg font-bold text-white text-sm font-['Plus_Jakarta_Sans',Helvetica] transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Photo Previews */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-[#472326] border border-[#663335]">
                  <img
                    src={getImagePreview(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#e82833] hover:bg-[#c62229] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <p className="text-xs text-[#a08082] mt-1 truncate">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
