"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X, LogOut, Package, Sidebar, ChevronDown, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Mobile Sidebar Toggle Button */}
          <div className="md:hidden mr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Sidebar className="w-5 h-5" />
            </Button>
          </div>

          {/* Company Logo and Name - Left side with no extra space */}
          <Link href="/" className="flex items-center ">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900 ml-2">DePrint</span>
          </Link>

          {/* Navigation Buttons - Center with little space */}
          <div className="hidden md:flex items-center ml-240 space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Products
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                  Policies <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/terms-of-service">Terms of Service</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/shipping-policy">Shipping Policy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/return-policy">Return Policy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* User Profile and Options - Right side */}
          <div className="hidden md:flex items-center ml-auto space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="lg" className="relative">
                <ShoppingCart className="w-8 h-8" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
            {/* Custom Profile Popover */}
            {status === "loading" ? (
              <div className="flex items-center justify-center h-10 w-24">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : status === "authenticated" && session?.user ? (
              <div className="relative">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" onClick={() => setShowProfileMenu(v => !v)}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                      {getUserInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                {showProfileMenu && (
                  <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border z-50 py-2">
                    <div className="px-4 py-2 border-b">
                      <div className="font-medium text-sm">{session.user.name || 'User'}</div>
                      <div className="text-xs text-muted-foreground">{session.user.email}</div>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm">Orders</Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : status === "unauthenticated" ? (
              <Link href="/api/auth/signin">
                <Button size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Mobile Actions - Right side */}
          <div className="md:hidden flex items-center ml-auto space-x-2">
            {/* Mobile Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile User Menu */}
            {status === "loading" ? (
              <div className="flex items-center justify-center h-10 w-24">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : status === "authenticated" && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {getUserInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : status === "unauthenticated" ? (
              <Link href="/api/auth/signin">
                <Button size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            ) : null}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <div>
                <button 
                  onClick={() => setShowPolicies(!showPolicies)} 
                  className="w-full flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Policies</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPolicies ? 'rotate-180' : ''}`} />
                </button>
                {showPolicies && (
                  <div className="flex flex-col space-y-2 pl-4 pt-2">
                    <Link href="/terms-of-service" className="text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Terms of Service</Link>
                    <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Privacy Policy</Link>
                    <Link href="/shipping-policy" className="text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Shipping Policy</Link>
                    <Link href="/return-policy" className="text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Return Policy</Link>
                  </div>
                )}
              </div>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Cart */}
              <Link
                href="/cart"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile User Actions */}
              {status === "loading" ? (
                <div className="flex items-center justify-center h-10 w-24">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : status === "authenticated" && session?.user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {getUserInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {session.user.name || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="justify-start text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : status === "unauthenticated" ? (
                <Link
                  href="/api/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button size="sm" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4">
          <nav className="flex flex-col gap-1">
            <Link 
              href="/" 
              className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100 font-medium"
              onClick={toggleSidebar}
            >
              All Products
            </Link>
            <Link 
              href="/products" 
              className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              Products
            </Link>
            <div>
              <button 
                onClick={() => setShowPolicies(!showPolicies)} 
                className="w-full flex justify-between items-center text-sm py-2 px-2 rounded hover:bg-gray-100 font-medium"
              >
                <span>Policies</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPolicies ? 'rotate-180' : ''}`} />
              </button>
              {showPolicies && (
                <div className="flex flex-col gap-1 pl-4 pt-1">
                   <Link href="/terms-of-service" className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100" onClick={toggleSidebar}>Terms of Service</Link>
                   <Link href="/privacy-policy" className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100" onClick={toggleSidebar}>Privacy Policy</Link>
                   <Link href="/shipping-policy" className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100" onClick={toggleSidebar}>Shipping Policy</Link>
                   <Link href="/return-policy" className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100" onClick={toggleSidebar}>Return Policy</Link>
                </div>
              )}
            </div>
            <Link 
              href="/contact" 
              className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              Contact
            </Link>
            <Link 
              href="/cart" 
              className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              Cart
            </Link>
            {status === "loading" ? null : status === "authenticated" && session?.user && (
              <>
                <Link 
                  href="/profile" 
                  className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
                  onClick={toggleSidebar}
                >
                  Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
                  onClick={toggleSidebar}
                >
                  Orders
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
} 