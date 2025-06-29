import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Force Node.js runtime for file uploads on Vercel
export const runtime = "nodejs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    console.log(`Processing ${files.length} files for upload`);
    
    const uploadPromises = files.map(async (file, index) => {
      console.log(`Processing file ${index + 1}: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      
      // Check file size for Vercel limits (4.5MB)
      const maxSize = 4.5 * 1024 * 1024; // 4.5MB
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 4.5MB for Vercel deployment.`);
      }
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine if it's a GIF
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      
      if (isGif) {
        console.log(`Processing GIF file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
      
      // Upload to Cloudinary
      return new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadOptions = {
          folder: "ecommerce-products",
          resource_type: "auto" as const, // This allows videos, GIFs, and images
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
          eager: [
            { width: 800, height: 800, crop: "limit", quality: "auto" }
          ],
          eager_async: true,
        };

        // Add GIF-specific options
        if (isGif) {
          console.log(`Processing GIF file: ${file.name}`);
          // For GIFs, we might want to preserve the animation
          uploadOptions.transformation = [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" }
          ];
        }

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error(`Upload error for file ${file.name}:`, error);
              reject(error);
            } else {
              console.log(`Successfully uploaded file ${file.name}:`, result?.secure_url);
              resolve(result as { secure_url: string });
            }
          }
        ).end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    console.log(`Successfully uploaded ${imageUrls.length} files`);

    return NextResponse.json({ 
      success: true, 
      imageUrls,
      message: `${imageUrls.length} file(s) uploaded successfully` 
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 