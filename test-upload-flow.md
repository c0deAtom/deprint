# Image Upload System Test Flow

## How the System Works:

### 1. **Admin Uploads Images**
- Go to `/admin/products` in your browser
- Fill in product details (name, description, price, etc.)
- Click "Upload Images" button
- Select image files from your computer
- Images are automatically uploaded to `/public/uploads/` folder
- URLs like `/uploads/1234567890-abc123.jpg` are generated

### 2. **Database Storage**
- Only the image URLs are stored in the database
- Example: `["/uploads/1234567890-abc123.jpg", "/uploads/1234567890-def456.png"]`
- Actual image files are stored in `public/uploads/` folder

### 3. **Frontend Display**
- Product pages load images using the URLs from database
- Images are served from `public/uploads/` folder
- If no images exist, shows placeholder icon

## Test Steps:

1. **Start the server**: `npm run dev`
2. **Go to admin page**: `http://localhost:3000/admin/products`
3. **Add a new product**:
   - Fill in product details
   - Upload some images using the "Upload Images" button
   - Click "Add Product"
4. **Check the results**:
   - Look in `public/uploads/` folder - you should see the uploaded images
   - Check the database - you should see URLs like `/uploads/filename.jpg`
   - Go to `/products` - you should see the product with images
   - Click on the product - you should see the images on the detail page

## File Structure:
```
public/
  uploads/           # Images are stored here
    1234567890-abc123.jpg
    1234567890-def456.png
    ...

src/
  app/
    api/
      upload/        # Handles file uploads
      products/      # Handles product CRUD
    admin/
      products/      # Admin interface
    products/        # Product display pages
```

## Database Schema:
```sql
Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]    # Array of URLs like ["/uploads/file1.jpg"]
  category: string
  stock: number
}
```

The system is working correctly! Images are saved to the public folder and URLs are stored in the database. 