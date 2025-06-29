"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X, LogOut, Package, Sidebar } from "lucide-react";
import { useCart } from '@/hooks/useCart';
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
  const { data: session } = useSession();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <nav className="bg-white shadow-sm border-b">
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
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 ml-2">EcomStore</span>
          </Link>

          {/* Navigation Buttons - Center with little space */}
          <div className="hidden md:flex items-center ml-16 space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Products
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

            {/* User Menu */}
            {session?.user ? (
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
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
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
            {session?.user ? (
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
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

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
              {session?.user ? (
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
              ) : (
                <Link
                  href="/api/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button size="sm" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
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
            <Link 
              href="/cart" 
              className="hover:underline text-sm py-2 px-2 rounded hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              Cart
            </Link>
            {session?.user && (
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