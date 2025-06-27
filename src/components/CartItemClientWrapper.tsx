"use client";
import CartItem from "@/components/CartItem";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export default function CartItemClientWrapper({ product }: { product: Product }) {
  return <CartItem product={product} />;
} 