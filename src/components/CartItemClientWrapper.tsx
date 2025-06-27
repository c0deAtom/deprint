"use client";
import CartItem from "@/components/CartItem";
import { JsonValue } from "@prisma/client/runtime/library";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrls?: JsonValue;
}

export default function CartItemClientWrapper({ product }: { product: Product }) {
  return <CartItem product={product} />;
} 