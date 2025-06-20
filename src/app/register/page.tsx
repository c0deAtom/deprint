"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/login");
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your details to sign up
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Name"
              required
              disabled={isLoading}
              autoComplete="name"
            />
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
              autoComplete="new-password"
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
              {isLoading ? "Loading..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">Login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 