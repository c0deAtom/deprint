"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, ChevronDown, User, Package, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  // Get user's first name
  const getFirstName = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ')[0];
    }
    if (email) {
      return email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="w-full py-6 border-b flex justify-between items-center px-4 md:px-8">
      <button
        className="md:hidden mr-4 p-2 rounded hover:bg-gray-100 focus:outline-none"
        aria-label="Open sidebar"
        onClick={handleSidebarToggle}
      >
        <Menu className="w-6 h-6" />
      </button>
      <Link href="/" className="text-xl font-bold tracking-tight">deprint2</Link>
      <nav className="flex gap-6 text-sm items-center">
       
      
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                <span className="font-medium text-sm">
                  {getFirstName(session.user.name, session.user.email)}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  My Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" onClick={() => signIn()}>Sign In</Button>
        )}
      </nav>
    </header>
  );
} 