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

    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine if it's a video or image
      const isVideo = file.type.startsWith('video/');
      
      // Upload to Cloudinary
      return new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadOptions = {
          folder: "ecommerce-products",
          resource_type: isVideo ? "video" as const : "auto" as const,
          transformation: isVideo ? [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { format: "mp4" }
          ] : [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        };

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as { secure_url: string });
            }
          }
        ).end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    return NextResponse.json({ 
      success: true, 
      imageUrls,
      message: `${imageUrls.length} image(s) uploaded successfully` 
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
} 