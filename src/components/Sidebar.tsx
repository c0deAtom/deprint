import Link from "next/link";

const categories = [
  { name: "Toys", href: "/products?category=toys" },
  { name: "Pots", href: "/products?category=pots" },
  { name: "Keychain", href: "/products?category=keychain" },
  { name: "3Dcube", href: "/products?category=3dcube" },
  // Add more categories as needed
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-full bg-white border-r flex flex-col gap-6 py-8 px-4">
      {/* Categories */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Categories</div>
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="hover:underline text-sm py-1 px-2 rounded hover:bg-gray-100">
              {cat.name}
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