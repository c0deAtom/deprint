# Image Upload Setup Guide

This guide will help you set up image upload functionality for your e-commerce application using Cloudinary.

## Features Implemented

- ✅ Drag & drop image upload
- ✅ Multiple image support (up to 5 images per product)
- ✅ Image preview with delete functionality
- ✅ Automatic image optimization and resizing
- ✅ Support for JPG, PNG, WebP, GIF formats
- ✅ 5MB file size limit per image
- ✅ Cloud storage with Cloudinary

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, go to your Dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**

### 2. Configure Environment Variables

Your `.env` file should already have the Cloudinary configuration. If not, add these lines:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 3. Test the Image Upload

1. Start your development server: `npm run dev`
2. Go to your admin panel: `/admin`
3. Click "Add Product"
4. Use the new image upload area to drag & drop or select images
5. Images will be automatically uploaded to Cloudinary and optimized

## How It Works

### Image Upload Flow

1. **User selects/drops images** → ImageUpload component
2. **Images are validated** → File type, size, and count checks
3. **Images are uploaded** → Cloudinary API via `/api/upload`
4. **Images are optimized** → Automatic resizing and compression
5. **URLs are returned** → Stored in product database
6. **Images are displayed** → Preview with delete functionality

### File Structure

```
src/
├── app/
│   └── api/
│       └── upload/
│           └── route.ts          # Image upload API
├── components/
│   └── ImageUpload.tsx           # Reusable upload component
└── app/
    └── admin/
        └── page.tsx              # Updated admin page
```

### API Endpoints

- `POST /api/upload` - Upload images to Cloudinary
  - Accepts: FormData with "images" field
  - Returns: Array of image URLs

### Component Props

```tsx
<ImageUpload
  existingImages={string[]}        // Current images
  onImagesUploaded={(urls) => {}}  // Callback when images change
  maxImages={5}                    // Maximum images allowed
  className="custom-class"         // Optional CSS class
/>
```

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Uploads**: 25,000/month

This is more than sufficient for most small to medium e-commerce sites.

## Troubleshooting

### Common Issues

1. **"Upload failed" error**
   - Check your Cloudinary credentials in `.env`
   - Verify your Cloudinary account is active
   - Check browser console for detailed errors

2. **Images not displaying**
   - Ensure Cloudinary URLs are accessible
   - Check if images were uploaded successfully
   - Verify the image URLs are stored correctly in the database

3. **File size too large**
   - Images are limited to 5MB each
   - Use image compression tools if needed
   - Consider using WebP format for better compression

### Development vs Production

- **Development**: Uses Cloudinary for testing
- **Production**: Same Cloudinary setup, but with production credentials
- **Backup**: Consider implementing local storage fallback for critical images

## Security Considerations

- Images are validated on both client and server
- File types are restricted to image formats
- File sizes are limited to prevent abuse
- Cloudinary provides secure URLs with expiration options

## Next Steps

1. **Test the upload functionality** with various image types
2. **Customize the upload limits** if needed
3. **Add image cropping/editing** features
4. **Implement image lazy loading** for better performance
5. **Add image alt text** for accessibility

## Support

- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/
- React Dropzone: https://react-dropzone.js.org/ 