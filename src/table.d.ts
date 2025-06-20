import '@tanstack/react-table'
import { RowData } from '@tanstack/react-table'
import { Product } from '@/app/admin/products/components/columns'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateProduct: (updatedProduct: Product) => void
    deleteProduct: (productId: string) => void
  }
} 