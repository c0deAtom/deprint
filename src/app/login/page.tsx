"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email and password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              disabled={isLoading}
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="underline hover:text-primary">Sign up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <div className="bg-red-500 text-white p-4">If you see a red box, Tailwind is working!</div>
    </div>
  )
} 