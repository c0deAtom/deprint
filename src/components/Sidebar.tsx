"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
    <aside className="w-56 min-h-full bg-white border-r flex flex-col gap-6 py-8 px-4">
      {/* Categories */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Categories</div>
        <nav className="flex flex-col gap-1">
          <Link href="/" className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100 font-medium">
            All Products {loading ? "..." : `(${categoryCounts.reduce((total, cat) => total + cat.count, 0)})`}
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100">
              {cat} {loading ? "..." : `(${getCategoryCount(cat)})`}
            </Link>
          ))}
        </nav>
      </div>
      {/* Quick Links */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Quick Links</div>
        <nav className="flex flex-col gap-1">
          <Link href="/products" className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100">All Products</Link>
          <Link href="/admin" className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100">Admin</Link>
          <Link href="/cart" className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100">Cart</Link>
        </nav>
      </div>
    </aside>
  );
} 