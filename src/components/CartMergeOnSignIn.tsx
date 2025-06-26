"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function CartMergeOnSignIn() {
  const { data: session, status } = useSession();
  const prevUser = useRef<string | null>(null);

  useEffect(() => {
    // Only run when user signs in (session changes from null to user)
    const userId = (session?.user as { id?: string })?.id;
    if (status === "authenticated" && userId && prevUser.current !== userId) {
      const cart: { id: string }[] = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length > 0) {
        Promise.all(
          cart.map((item) =>
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: item.id }),
            })
          )
        ).then(() => {
          localStorage.removeItem("cart");
          window.dispatchEvent(new Event("storage"));
          setTimeout(() => {
            window.dispatchEvent(new Event("cart-updated"));
          }, 300);
        });
      }
      prevUser.current = userId;
    }
    if (status === "unauthenticated") {
      prevUser.current = null;
    }
  }, [session, status]);

  return null;
} 