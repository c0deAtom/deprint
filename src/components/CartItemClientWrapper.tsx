"use client";
import CartItem from "@/components/CartItem";

export default function CartItemClientWrapper({ product }: { product: any }) {
  return <CartItem product={product} />;
} 