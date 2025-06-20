"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User } from "lucide-react"

export function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">DePrint</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/products"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/products" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/categories" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Categories
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 