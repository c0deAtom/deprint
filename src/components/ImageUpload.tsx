"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
  className?: string;
}

export default function ImageUpload({ 
  onImagesUploaded, 
  existingImages = [], 
  maxImages = 5,
  className = "" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Show specific message for GIFs
      const hasGif = acceptedFiles.some(file => file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif'));
      if (hasGif) {
        toast.info("Uploading GIF files may take longer. Please be patient...");
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = [...images, ...data.imageUrls];
        setImages(newImages);
        onImagesUploaded(newImages);
        toast.success(data.message);
      } else {
        const error = await response.json();
        const errorMessage = error.details || error.error || "Upload failed";
        toast.error(`Upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again with a smaller file.");
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"]
    },
    maxSize: 4.5 * 1024 * 1024, // 4.5MB for Vercel compatibility
    multiple: true,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Maximum size is 4.5MB for deployment compatibility.`);
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`);
          }
        });
      });
    },
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
              }
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the images here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  {uploading ? "Uploading..." : "Upload Product Media"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag & drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, WebP, GIF, MP4, MOV, AVI, WebM, MKV (max 4.5MB each, up to {maxImages} files)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((media, index) => {
            const isVideo = media.includes('.mp4') || media.includes('.mov') || media.includes('.avi') || media.includes('.webm') || media.includes('.mkv');
            
            return (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    {isVideo ? (
                      <video
                        src={media}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <Image
                        src={media}
                        alt={`Product media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Uploading images...</span>
        </div>
      )}
    </div>
  );
} 