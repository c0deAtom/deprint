"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Grid3X3, ShoppingBag, Settings, ShoppingCart } from "lucide-react";

const categories = [
  "Toys",
  "Pots",
  "Keychain",
  "3Dcube",
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Books",
  "Sports",
  "Other"
];

interface CategoryCount {
  category: string;
  count: number;
}

export default function Sidebar() {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const res = await fetch('/api/products/categories');
        if (res.ok) {
          const data = await res.json();
          setCategoryCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const getCategoryCount = (categoryName: string) => {
    const category = categoryCounts.find(cat => cat.category === categoryName);
    return category ? category.count : 0;
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-16 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 border-r border-gradient-warm shadow-lg overflow-hidden flex flex-col">
     

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        <div className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Browse Categories
            </div>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/" 
                className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-200 font-medium group"
              >
                <span className="group-hover:text-blue-600 transition-colors">All Products</span>
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
                  {loading ? "..." : categoryCounts.reduce((total, cat) => total + cat.count, 0)}
                </span>
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat} 
                  href={`/?category=${encodeURIComponent(cat)}`} 
                  className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
                >
                  <span className="group-hover:text-purple-600 transition-colors">{cat}</span>
                  <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white px-2 py-1 rounded-full">
                    {loading ? "..." : getCategoryCount(cat)}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Quick Links
            </div>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/products" 
                className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
              >
                <ShoppingBag className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                <span className="group-hover:text-blue-600 transition-colors">All Products</span>
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
              >
                <Settings className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
                <span className="group-hover:text-purple-600 transition-colors">Admin</span>
              </Link>
              <Link 
                href="/cart" 
                className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
              >
                <ShoppingCart className="w-4 h-4 group-hover:text-pink-600 transition-colors" />
                <span className="group-hover:text-pink-600 transition-colors">Cart</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-6 bg-white/30 backdrop-blur-sm border-t border-white/20">
        <div className="w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>
      </div>
    </aside>
  );
} 