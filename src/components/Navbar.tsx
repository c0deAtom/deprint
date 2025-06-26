"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count for signed-in users
  const fetchCartCount = async () => {
    if (session?.user) {
      const res = await fetch("/api/cart?allPending=1");
      const data = await res.json();
      // Sum all item quantities
      const count = (Array.isArray(data) ? data : [data])
        .flatMap((order: { items: { quantity?: number }[] }) => order.items || [])
        .reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // Listen for cart changes
    function handleCartUpdate() {
      fetchCartCount();
    }
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <header className="w-full py-6 border-b flex justify-between items-center px-4 md:px-8">
      <Link href="/" className="text-xl font-bold tracking-tight">deprint2</Link>
      <nav className="flex gap-6 text-sm items-center">
       
        <Link href="/admin" className="hover:underline">Admin</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
        <Link href="/policy" className="hover:underline">Policy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/cart" className="relative">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartCount}</span>
          )}
        </Link>
        {status === "loading" ? null : session?.user ? (
          <div className="flex items-center gap-2 ml-4">
            <span className="font-medium text-sm">{session.user.name || session.user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => signIn()}>Sign In</Button>
        )}
      </nav>
    </header>
  );
} 