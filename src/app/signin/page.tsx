"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, User, ShoppingBag, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      
      if (res?.ok) {
        setMessage("Welcome back! Redirecting...");
        setTimeout(() => router.push("/"), 1000);
      } else {
        setMessage("Invalid email or password. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setMessage("Account created successfully! You can now sign in.");
        setTab("signin");
        setForm({ email: "", password: "", name: "" });
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to create account. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {tab === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {tab === "signin" 
                ? "Sign in to your account to continue shopping" 
                : "Create a new account to start shopping"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  tab === "signin" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  setTab("signin");
                  setMessage("");
                }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  tab === "signup" 
                    ? "bg-white text-purple-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  setTab("signup");
                  setMessage("");
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">
                  {error === "CredentialsSignin" 
                    ? "Invalid email or password. Please try again." 
                    : "Authentication failed. Please try again."
                  }
                </p>
              </div>
            )}

            {/* Success/Error Messages */}
            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                message.includes("successfully") || message.includes("Welcome") 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-red-50 border border-red-200"
              }`}>
                {message.includes("successfully") || message.includes("Welcome") ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-sm ${
                  message.includes("successfully") || message.includes("Welcome") 
                    ? "text-green-700" 
                    : "text-red-700"
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* Sign In Form */}
            {tab === "signin" ? (
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className="pl-10 border-2 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      className="pl-10 border-2 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin inline-block align-middle" /> Signing in...</>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signup");
                        setMessage("");
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Sign Up Form */
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      className="pl-10 border-2 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className="pl-10 border-2 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      className="pl-10 border-2 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signin");
                        setMessage("");
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Separator */}
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or</span>
              </div>
            </div>

            {/* Continue as Guest */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Want to browse without an account?
              </p>
              <Link href="/">
                <Button variant="outline" className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                  Continue as Guest
                </Button>
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500">
              <p>
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 