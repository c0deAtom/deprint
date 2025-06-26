"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setMessage("Invalid email or password");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Account created! You can now sign in.");
      setTab("signin");
      setForm({ email: "", password: "", name: "" });
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to sign up");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6">
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${tab === "signin" ? "bg-primary text-white" : "bg-muted"}`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === "signup" ? "bg-primary text-white" : "bg-muted"}`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className={`text-sm ${message.includes("error") ? "text-red-600" : "text-green-700"}`}>{message}</div>}
        {tab === "signin" ? (
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
            <Input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <Button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</Button>
          </form>
        )}
      </Card>
    </main>
  );
} 