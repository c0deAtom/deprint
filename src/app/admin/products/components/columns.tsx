"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageIcon } from "lucide-react"
import { ProductActions } from "./product-actions"

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.images?.[0]
      const isValidImage = !!imageUrl && (imageUrl.startsWith('/') || imageUrl.startsWith('http'));

      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
          {isValidImage ? (
            <Image
              src={imageUrl}
              alt={row.original.name}
              width={64}
              height={64}
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const { updateProduct, deleteProduct } = table.options.meta || {}
      return (
        <ProductActions 
          product={row.original} 
          onEditSuccess={updateProduct || (() => {})} 
          onDeleteSuccess={deleteProduct || (() => {})}
        />
      )
    },
  },
] 