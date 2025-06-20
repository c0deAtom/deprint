"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxFiles?: number
}

export function ImageUpload({ 
  value = [], 
  onChange, 
  multiple = true, 
  maxFiles = 5 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (value.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      if (data.success) {
        const newUrls = multiple ? [...value, ...data.urls] : data.urls
        onChange(newUrls)
        toast.success("Images uploaded successfully")
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || value.length >= maxFiles}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Images"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {value.length}/{maxFiles} images
          </span>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border overflow-hidden">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 