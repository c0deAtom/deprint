# Cloudinary Setup Guide

To use the image upload functionality, you need to set up Cloudinary credentials.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, go to your Dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the values with your actual Cloudinary credentials.

## Step 3: Test the Upload

1. Start your development server: `npm run dev`
2. Go to your admin panel: `/admin`
3. Click "Add Product"
4. Use the "Upload Images" tab to drag & drop or select images
5. Images will be automatically uploaded to Cloudinary and optimized

## Features

- ✅ Drag & drop image upload
- ✅ Multiple image support (up to 5 images per product)
- ✅ Image preview with delete functionality
- ✅ Automatic image optimization and resizing
- ✅ Support for JPG, PNG, WebP, GIF formats
- ✅ 5MB file size limit per image
- ✅ Cloud storage with Cloudinary
- ✅ Both upload and link options available

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Uploads**: 25,000/month

This is more than sufficient for most small to medium e-commerce sites.

## Troubleshooting

If you get upload errors:
1. Check your Cloudinary credentials in `.env.local`
2. Verify your Cloudinary account is active
3. Check browser console for detailed errors
4. Ensure the `.env.local` file is in the project root directory 